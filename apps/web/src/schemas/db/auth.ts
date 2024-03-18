import type { InferSelectModel } from 'drizzle-orm';
import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { generateDendrite } from '../../modules/utils';
export enum AccountTypes {
	email = 0,
	github = 1,
	google = 2
}
export enum Action {
	signup = 0,
	signin = 1
}
export const UserTable = sqliteTable(
	'Users',
	{
		id: integer('id').notNull().primaryKey().$defaultFn(generateDendrite),
		name: text('name'),
		email: text('email').notNull().unique(),
		emailVerified: integer('emailVerified', { mode: 'boolean' }),
		image: text('image'),
		paymentId: text('paymentId').unique(),
		type: integer('type').$type<AccountTypes>().notNull(),
		accountId: text('accountId')
	},
	(table) => ({
		emailIdx: index('emailIdx').on(table.email, table.id, table.type, table.accountId),
		oauthIdx: index('oauthIdx').on(table.accountId, table.type, table.id)
	})
);
export const VerificationTokenTable = sqliteTable(
	'VerificationTokens',
	{
		identifier: text('identifier').notNull().primaryKey(),
		name: text('name'),
		type: integer('type').$type<Action>().notNull(),
		token: text('token').notNull().unique(),
		expires: integer('expires', { mode: 'timestamp' }).notNull()
	},
	(vt) => ({
		findByToken: index('findByToken').on(vt.token, vt.identifier)
	})
);
export type UserTableSelect = InferSelectModel<typeof UserTable>;
