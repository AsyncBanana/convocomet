import type { APIRoute } from 'astro';
import { assert } from 'superstruct';
import { SiteSchema } from '../../../../schemas/validation/site';
import { SiteTable } from '../../../../schemas/db/site';
import { parseRequestBody } from '../../../../modules/utils';
import { eq } from 'drizzle-orm';
import { CommentTable, QueueTable } from '../../../../schemas/db/comment';
export const POST: APIRoute = async ({ request, params, locals: { db, getSession } }) => {
	const user = await getSession();
	const siteId = +params.site;
	if (!user) {
		return new Response('No/Invalid Authorization', {
			status: 402
		});
	}
	const body = await parseRequestBody(request);
	if (body instanceof Response) {
		return body;
	}
	if (typeof body.domainAllowList === 'string') {
		body.domainAllowList = [body.domainAllowList];
	}
	try {
		assert(body, SiteSchema);
	} catch (error) {
		return new Response(
			`Error validating body: ${[...error.failures()].map((e) => JSON.stringify(e)).join(' ')}`,
			{
				status: 400
			}
		);
	}
	const site = await db
		.select({
			owner: SiteTable.owner
		})
		.from(SiteTable)
		.where(eq(SiteTable.id, siteId))
		.get();
	if (!site) {
		return new Response('site not found', {
			status: 404
		});
	}
	if (site.owner !== user.id) {
		return new Response('Current signed-in user not owner of site', {
			status: 400
		});
	}
	try {
		// TODO Optimize
		await db.batch([
			db.delete(SiteTable).where(eq(SiteTable.id, siteId)),
			db.insert(SiteTable).values({
				...body,
				id: siteId,
				owner: site.owner
			})
		]);
	} catch (err) {
		console.error(err);
		return new Response('Settings update failed', {
			status: 500
		});
	}
	return new Response(null, {
		status: 204
	});
};
export const DELETE: APIRoute = async ({ request, params, locals: { db, getSession } }) => {
	const user = await getSession();
	const siteId = +params.site;
	if (!user) {
		return new Response('No/Invalid Authorization', {
			status: 402
		});
	}
	const site = await db
		.select({
			owner: SiteTable.owner
		})
		.from(SiteTable)
		.where(eq(SiteTable.id, siteId))
		.get();
	if (!site) {
		return new Response('Site not found', {
			status: 404
		});
	}
	if (site.owner !== user.id) {
		return new Response('Current signed-in user not owner of site', {
			status: 400
		});
	}
	try {
		await db.batch([
			db.delete(SiteTable).where(eq(SiteTable.id, siteId)),
			db.delete(CommentTable).where(eq(CommentTable.siteId, siteId)),
			db.delete(QueueTable).where(eq(QueueTable.siteId, siteId))
		]);
	} catch (err) {
		console.error(err);
		return new Response('Error deleting site', {
			status: 500
		});
	}
	return new Response(null, {
		status: 204
	});
};
