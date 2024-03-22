import type { APIRoute } from 'astro';
import { SiteTable } from '../../../../schemas/db/site';
import { eq, or } from 'drizzle-orm';
import { QueueTable } from '../../../../schemas/db/comment';

export const GET: APIRoute = async ({ request, params, locals: { db, getSession } }) => {
	const { siteId } = params;
	const url = new URL(request.url);
	// @ts-expect-error
	const comments: number[] = url.searchParams.getAll('comment');
	if (comments.length === 0) {
		return new Response('No comments passed', {
			status: 400
		});
	}
	for (const index in comments) {
		const comment = +comments[index];
		if (isNaN(comment)) {
			return new Response('Invalid comment id', {
				status: 400
			});
		}
		comments[index] = comment;
	}
	const user = await getSession();
	if (!user) {
		return new Response('No/Invalid Authorization', {
			status: 402
		});
	}
	let siteConfig;
	try {
		siteConfig = await db
			.select({
				owner: SiteTable.owner
			})
			.from(SiteTable)
			.where(eq(SiteTable.id, +siteId))
			.get();
	} catch {
		return new Response('Error retrieving site details', { status: 500 });
	}
	if (!siteConfig) {
		return new Response('Site does not exist', { status: 404 });
	}
	if (siteConfig.owner !== user.id) {
		return new Response('Site not accessible from this account', { status: 403 });
	}
	const CommentWhere =
		comments.length > 1
			? or(...comments.map((comment) => eq(QueueTable.id, comment)))
			: eq(QueueTable.id, comments[0]);
	try {
		await db.delete(QueueTable).where(CommentWhere).run();
	} catch (err) {
		console.log(err);
		return new Response('Error rejecting comment', { status: 500 });
	}
	return new Response('Comments rejected', { status: 200 });
};
