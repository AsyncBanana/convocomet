import type { APIRoute } from 'astro';
import { XMLParser } from 'fast-xml-parser';
import { SiteTable } from '../../../../../schemas/db/site';
import { eq } from 'drizzle-orm';
import { CommentTable, type QueueTableInsert } from '../../../../../schemas/db/comment';
import { generateDendrite } from '../../../../../modules/utils';
export interface DisqusAuthor {
	name: string;
	isAnonymous: boolean;
	username: string;
}
export interface DisqusCategory {
	forum: string;
	title: string;
	isDefault: boolean;
}
export interface DisqusThread {
	id: string;
	forum: string;
	category: string;
	link: string;
	title: string;
	message: string;
	createdAt: string;
	author: DisqusAuthor;
	'@_dsq:id': string;
}
export interface DisqusPost {
	id: string;
	message: string;
	createdAt: string;
	isDeleted: boolean;
	isSpam: boolean;
	author: DisqusAuthor;
	thread: { '@_dsq:id': string };
	parent?: { '@_dsq:id': string };
	'@_dsq:id': string;
}
export interface DisqusXML {
	category: DisqusCategory;
	thread: DisqusThread | DisqusThread[];
	post: DisqusPost[];
}
export interface DisqusXMLGroup {
	disqus: DisqusXML | DisqusXML[];
}
export const POST: APIRoute = async (ctx) => {
	const user = await ctx.locals.getSession();
	const siteId = +ctx.params.site;
	if (!user) {
		return new Response('No/Invalid Authorization', {
			status: 402
		});
	}
	const body = await ctx.request.formData();
	if (!body || !body.has('import')) return new Response('Please pass a file');
	const site = await ctx.locals.db
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
	const valImport = body.get('import');
	let decodedVal: string;
	if (valImport instanceof File && valImport.type === 'application/gzip') {
		const decompress = new DecompressionStream('gzip');
		const stream = valImport.stream() as unknown as ReadableStream;
		const textDecode = new TextDecoderStream();
		stream.pipeThrough(decompress);
		decompress.readable.pipeThrough(textDecode);
		const chunks = [];
		// @ts-expect-error
		for await (const chunk of textDecode.readable) {
			chunks.push(chunk);
		}
		decodedVal = chunks.join();
	} else if (valImport instanceof File) {
		decodedVal = await valImport.text();
	} else {
		decodedVal = valImport;
	}
	const parser = new XMLParser({ ignoreAttributes: false, ignoreDeclaration: true });
	// TODO: Ensure this is the proper format handling; This has only been tested with one basic file;
	const importData: DisqusXMLGroup = parser.parse(decodedVal);
	if (!Array.isArray(importData.disqus)) {
		importData.disqus = [importData.disqus]; // Excellent performance characteristics :)
	}
	const parentLookup = {};
	const importedValues: QueueTableInsert[] = []; // use QueueTable type rather than normal type because normal type has corrupted types
	importData.disqus.forEach((el) => {
		el.post.forEach((post) => {
			if (!Array.isArray(el.thread)) el.thread = [el.thread];
			const curThread = el.thread.find((thread) => post.thread['@_dsq:id'] === thread['@_dsq:id']);
			const page = new URL(curThread.link).pathname;
			const id = generateDendrite();
			importedValues.push({
				id,
				author: post.author.name,
				text: post.message,
				pageId: page,
				sourceId: post.parent ? parentLookup[post.parent['@_dsq:id']] : undefined,
				siteId: siteId,
				created: new Date(post.createdAt),
				notifications: false
			});
			parentLookup[post['@_dsq:id']] = id;
		});
	});
	try {
		await ctx.locals.db.insert(CommentTable).values(importedValues).run();
	} catch (err) {
		console.error(err);
		return new Response('Error importing data', { status: 500 });
	}
	return new Response(undefined, { status: 201 });
};
