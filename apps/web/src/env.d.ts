/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

type Auth = import('lucia').Auth;
type DirectoryRuntime = import('@astrojs/cloudflare').DirectoryRuntime;
type AnalyticsDataset = import('@cloudflare/workers-types').AnalyticsEngineDataset;
type LibSQLDatabase = import('drizzle-orm/libsql').LibSQLDatabase;
type RawLibSQLDatabase = import('@libsql/client').Client;
declare namespace App {
	interface Locals extends DirectoryRuntime {
		db: LibSQLDatabase;
		rawDB: RawLibSQLDatabase;
		parseSession: () => Promise<number | null>;
		// void option is just too allow for nesting parseSession in getSession directly
		getSession: () => Promise<import('./schemas/db/auth').UserTableSelect | undefined>;
		getBatchSession: <T extends import('drizzle-orm/batch').BatchItem<'sqlite'>[]>(
			additionalQueries: T
		) => Promise<{
			user?: import('./schemas/db/auth').UserTableSelect | undefined;
			data?: {
				[Property in keyof T]: Awaited<ReturnType<T[Property]['all']>>;
			};
		}>;
		data: {
			user?: import('./schemas/db/auth').UserTableSelect | null;
		};
		VIEW_ANALYTICS?: AnalyticsEngineDataset;
		COMMENT_ANALYTICS?: AnalyticsEngineDataset;
	}
}
interface ImportMetaEnv {
	readonly DATABASE_URL: string;
	readonly DATABASE_TOKEN?: string;
	readonly AUTH_SECRET: string;
	readonly GITHUB_ID: string;
	readonly GOOGLE_OAUTH_ID: string;
	readonly GOOGLE_OAUTH_SECRET: string;
	readonly GITHUB_SECRET: string;
	readonly AKISMET_KEY: string;
	readonly CLOUDFLARE_ACCOUNT_ID: string;
	readonly DKIM_PRIVATE_KEY: string;
	readonly ANALYTICS_TOKEN: string;
	readonly LEMONSQUEEZY_KEY?: string;
	readonly LEMONSQUEEZY_PRO_ID?: string;
	readonly LEMONSQUEEZY_WEBHOOK_KEY?: string;
	readonly PUBLIC_LEMONSQUEEZY_CHECKOUT_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare namespace App {}
declare module '*.mjml' {
	const template: string;
	export default template;
}
