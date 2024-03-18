import type { APIRoute } from 'astro';
import { assert } from 'superstruct';
import { SiteSchema } from '../../../schemas/validation/site';
import { SiteTable } from '../../../schemas/db/site';
import { parseRequestBody } from '../../../modules/utils';
export const POST: APIRoute = async ({ request, locals: { db, getSession } }) => {
	const user = await getSession();
	if (!user) {
		return new Response('No/Invalid Authorization', {
			status: 402
		});
	}
	const body = await parseRequestBody(request);
	if (body instanceof Response) {
		return body;
	}
	if ('domainAllowList' in body && typeof body.domainAllowList === 'string') {
		body.domainAllowList = [body.domainAllowList];
	}
	try {
		assert(body, SiteSchema);
	} catch (error) {
		return new Response(JSON.stringify(error.failures()), {
			status: 400,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
	body.name = body.name.replaceAll(/</g, '&lt;').replaceAll(/>/g, '&gt;');
	const newSite = await db
		.insert(SiteTable)
		.values({
			...body,
			owner: user.id
		})
		.returning({ id: SiteTable.id })
		.get();
	return new Response('Operation successful. Redirecting...', {
		status: 302,
		headers: {
			Location: `/dashboard/sites/${newSite.id}?new`
		}
	});
};
