import type { APIRoute } from 'astro';
import { assert } from 'superstruct';
import { type Comment, CommentSchema } from '../../../../schemas/validation/comment';
import type { QueueTableInsert as FullComment } from '../../../../schemas/db/comment';
import { SiteTable, type SiteTableSelect } from '../../../../schemas/db/site';
import { parseRequestBody } from '../../../../modules/utils';
import snarkdown from 'snarkdown';
import xss from 'xss';
import { CommentTable, type CommentTableSelect, QueueTable } from '../../../../schemas/db/comment';
import { eq, gt, lt, sql } from 'drizzle-orm';
import { replyNotification, moderationNotification } from '../../../../modules/emailNotification';
if (import.meta.env.DEV) {
	// @ts-expect-error
	globalThis.HTMLRewriter = (await import('html-rewriter-wasm')).HTMLRewriter;
}
export const GET: APIRoute = async ({ params, locals, url }) => {
	// NOTE: Astro currently errors when pageId starts with a slash; see https://github.com/withastro/astro/issues/7962
	const { db } = locals;
	const { id, page } = params;
	const offset = +url.searchParams.get('continuation');
	const order = url.searchParams.get('order') || 'newest';
	let results = await db.all<CommentTableSelect>(sql`WITH RECURSIVE
  get_replies(id${order === 'top' ? `, upvotes` : undefined}) AS (
	SELECT * FROM (SELECT ${CommentTable.id}${
		order === 'top' ? sql`, ${CommentTable.upvotes}` : undefined
	} FROM ${CommentTable} WHERE ${CommentTable.siteId} = ${id} AND ${
		CommentTable.pageId
	} = ${page} AND ${CommentTable.sourceId} IS NULL${
		offset
			? sql` AND ${
					order === 'oldest'
						? gt(CommentTable.id, offset)
						: lt(order === 'top' ? CommentTable.upvotes : CommentTable.id, offset)
				}`
			: undefined
	} ORDER BY ${
		order === 'top'
			? sql`${CommentTable.upvotes} DESC, ${CommentTable.id} DESC`
			: sql`${CommentTable.id} ${sql.raw(order === 'order' ? 'ASC' : 'DESC')}`
	} LIMIT 10)
    UNION ALL
    SELECT ${CommentTable.id}${
			order === 'top' ? sql`, ${CommentTable.upvotes}` : undefined
		} FROM ${CommentTable}, get_replies
     WHERE ${CommentTable.sourceId} = get_replies.id
	 ORDER BY ${order === 'top' ? CommentTable.upvotes : CommentTable.id} ${sql.raw(
			order === 'oldest' ? 'ASC' : 'DESC'
		)}
  )
  SELECT * FROM ${CommentTable} JOIN get_replies USING(id) ORDER BY ${
		order === 'top' ? CommentTable.upvotes : CommentTable.id
	} ${sql.raw(order === 'oldest' ? 'ASC' : 'DESC')};
 `);
	const idIndex = {};
	results.map((result) => {
		result.replies = [];
		result.created = result.created * 1000;
		return result;
	});
	results.forEach((v) => {
		// store reference to object by id
		idIndex[v.id] = v;
	});
	results = results
		.map((v) => {
			if (v.sourceId) {
				// access parent object through index and add child to replies (utilizes JavaScript's shallow object copying, as replies is shared between idIndex and results)
				idIndex[v.sourceId].replies.push(v);
				return undefined;
			}
			return v;
		})
		.filter((v) => !!v);
	let continuation;
	if (results.length === 10) {
		// Found max amount of comments; Likely more after
		continuation = order === 'top' ? results.at(-1).upvotes : results.at(-1).id;
	}
	if ('VIEW_ANALYTICS' in locals.runtime.env) {
		locals.runtime.env.VIEW_ANALYTICS.writeDataPoint({
			blobs: [page, locals.runtime.cf.country as string],
			indexes: [id]
		});
	}
	return new Response(
		JSON.stringify({
			comments: results || [],
			continuation
		})
	);
};
export const POST: APIRoute = async (ctx) => {
	const { params, request, locals } = ctx;
	const { db, getSession } = locals;
	const { id, page } = params;
	// Body validation
	// @ts-expect-error
	const body: Comment = await parseRequestBody(request);
	if (body instanceof Response) {
		return body;
	}
	try {
		assert(body, CommentSchema);
	} catch (error) {
		return new Response(
			`Error validating body: ${[...error.failures()].map((e) => JSON.stringify(e)).join(' ')}`,
			{
				status: 400
			}
		);
	}
	// Site existance validation
	let siteConfig: SiteTableSelect;
	try {
		siteConfig = await db.select().from(SiteTable).where(eq(SiteTable.id, +id)).get();
	} catch (err) {
		console.error(err);
		return new Response('Error accessing site configuration; Please check the Id passed', {
			status: 500
		});
	}
	if (!siteConfig) return new Response('Site not found', { status: 400 });
	const origin = new URL(
		request.headers.has('X-Referer')
			? request.headers.get('X-Referer')
			: request.headers.get('Origin')
	).origin;
	if (siteConfig.domainAllowList?.some((v) => !!v)) {
		if (!siteConfig.domainAllowList.includes(origin))
			return new Response('Invalid domain', { status: 400 });
	}
	const user = await getSession();
	if (body.notifications && !user?.email) {
		return new Response('Authentication required for notifications', {
			status: 401
		});
	}
	if (siteConfig.requireSignIn && !user) {
		return new Response('Authentication Required', {
			status: 401
		});
	}
	// Markdown
	body.text = snarkdown(body.text);
	// HTML Filter
	body.text = xss(body.text, {
		allowCommentTag: false,
		allowList: {
			header: [],
			code: ['class'],
			pre: [],
			b: [],
			blockquote: [],
			i: [],
			a: ['href'],
			strike: [],
			strong: [],
			img: ['src', 'alt', 'title'],
			u: [],
			br: [],
			em: [],
			ul: [],
			li: [],
			ol: []
		},
		css: false,
		stripIgnoreTagBody: ['script', 'style']
	});
	const fullComment: FullComment = {
		...body,
		created: new Date(),
		upvotes: 0,
		pageId: page,
		siteId: +id
	};
	if (user) {
		fullComment.authorId = user.id;
		fullComment.author = user.name;
	}
	if (!fullComment.author)
		return new Response('User must be signed in or pass an author', { status: 400 });
	fullComment.author = fullComment.author.replaceAll(/</g, '&lt;').replaceAll(/>/g, '&gt;');
	if (siteConfig.spamFilter) {
		const res = await fetch('https://rest.akismet.com/1.1/comment-check', {
			method: 'POST',
			body: new URLSearchParams({
				api_key: import.meta.env.AKISMET_KEY,
				blog: origin,
				comment_type: 'comment',
				referrer: request.headers.has('X-Referer')
					? request.headers.get('X-Referer')
					: request.headers.get('Referer'),
				user_agent: request.headers.get('user-agent'),
				user_ip: request.headers.get('x-forwarded-for') ?? '127.0.0.1',
				blog_charset: 'UTF-8',
				comment_author: fullComment.author,
				comment_author_email: user?.email,
				comment_content: fullComment.text,
				comment_date_gmt: new Date(fullComment.created).toISOString()
			})
		});
		if (!(await res.text())) {
			return new Response('Comment flagged as spam', {
				status: 400
			});
		}
	}
	// Analytics
	if ('COMMENT_ANALYTICS' in locals.runtime.env) {
		locals.runtime.env.COMMENT_ANALYTICS.writeDataPoint({
			blobs: [page, locals.runtime.cf.country as string],
			indexes: [id]
		});
	}
	try {
		if (siteConfig.manualModeration) {
			const newComment = await db.insert(QueueTable).values(fullComment).returning().get();
			ctx.locals.runtime.waitUntil(moderationNotification(newComment, siteConfig, ctx));
		} else {
			const commentData = await db.insert(CommentTable).values(fullComment).returning().get();
			ctx.locals.runtime.waitUntil(replyNotification(commentData, siteConfig, ctx));
		}
	} catch (err) {
		console.error(err);
		return new Response('Error creating comment', {
			status: 500
		});
	}
	return new Response(
		siteConfig.manualModeration ? 'Comment awaiting approval' : JSON.stringify(fullComment),
		{ status: siteConfig.manualModeration ? 200 : 201 }
	);
};
