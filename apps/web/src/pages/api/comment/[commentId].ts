import type { APIRoute } from 'astro';
import { CommentTable } from '../../../schemas/db/comment';
import { eq, sql } from 'drizzle-orm';
import { SiteTable } from '../../../schemas/db/site';
import { assert } from 'superstruct';
import { CommentUpdateSchema } from '../../../schemas/validation/commentUpdate';
import { parseRequestBody } from '../../../modules/utils';
export const DELETE: APIRoute = async ({ request, locals: { db, parseSession }, params }) => {
	const comment = params.commentId;
	const { siteId } = await db
		.select({ siteId: CommentTable.siteId })
		.from(CommentTable)
		.where(eq(CommentTable.id, comment))
		.get();
	if (!siteId) {
		return new Response('Comment not found', {
			status: 404
		});
	}
	const res = await Promise.allSettled([
		db.select({ owner: SiteTable.owner }).from(SiteTable).where(eq(SiteTable.id, siteId)).get(),
		parseSession()
	]);
	if (res[0].status === 'rejected' || res[1].status === 'rejected')
		return new Response('Error loading server config and session', { status: 500 });
	const [
		{
			value: { owner }
		},
		{ value: userId }
	] = res;
	if (owner !== userId) {
		return new Response('Not signed in as owner', {
			status: 403
		});
	}
	try {
		await db.delete(CommentTable).where(eq(CommentTable.id, comment)).run();
	} catch (err) {
		console.log(err);
		return new Response('Error deleting comment', { status: 500 });
	}
	return new Response(null, { status: 204 });
};
export const PATCH: APIRoute = async ({ request, locals: { db }, params }) => {
	const body = await parseRequestBody(request);
	if (body instanceof Response) {
		return body;
	}
	try {
		assert(body, CommentUpdateSchema);
	} catch (error) {
		return new Response(
			`Error validating body: ${[...error.failures()].map((e) => JSON.stringify(e)).join(' ')}`,
			{
				status: 400
			}
		);
	}
	const comment = params.commentId;
	const { siteId } =
		(await db
			.select({ siteId: CommentTable.siteId })
			.from(CommentTable)
			.where(eq(CommentTable.id, comment))
			.get()) || {};
	if (!siteId) {
		return new Response('Comment not found', {
			status: 404
		});
	}
	const { upvoteEnabled } = await db
		.select({ upvoteEnabled: SiteTable.upvoteEnabled })
		.from(SiteTable)
		.where(eq(SiteTable.id, siteId))
		.get();
	if (upvoteEnabled === false) {
		return new Response('Upvotes disabled in site', {
			status: 403
		});
	}
	try {
		await db
			.update(CommentTable)
			.set({ upvotes: sql`upvotes + 1` })
			.where(eq(CommentTable.id, comment))
			.run();
	} catch (err) {
		console.log(err);
		return new Response('Error upvoting comment', { status: 500 });
	}
	return new Response(null, { status: 204 });
};
