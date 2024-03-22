import { config } from 'dotenv';

const { parsed: env } = config({
	path: process.env.NODE_ENV === 'production' ? './.env.production' : './.env.development'
});

/** @type { import("drizzle-kit").Config } */
export default {
	schema: './src/schemas/db/*.ts',
	driver: process.env.NODE_ENV === 'production' ? 'turso' : 'libsql',
	dbCredentials: {
		url: env.DATABASE_URL,
		authToken: env.DATABASE_TOKEN
	}
};
