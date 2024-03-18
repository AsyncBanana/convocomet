import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateDendrite } from '../../modules/utils';
import { UserTable } from './auth';
import { SiteTable } from './site';

// TODO Types do not work with self referencing `references` calls unless isolated like this?
const idRef = () => CommentTable.id;
export const CommentTable = sqliteTable(
	'Comments',
	{
		id: integer('id').primaryKey().$defaultFn(generateDendrite),
		siteId: integer('siteId')
			.notNull()
			.references(() => SiteTable.id, { onDelete: 'cascade' }),
		text: text('text').notNull(),
		author: text('author').notNull(),
		authorId: integer('authorId').references(() => UserTable.id, { onDelete: 'set null' }),
		notifications: integer('notifications', { mode: 'boolean' }),
		// TODO use timestampId for created dates
		created: integer('created', { mode: 'timestamp' }).notNull(),
		upvotes: integer('upvotes').default(0),
		sourceId: integer('sourceId').references(idRef, { onDelete: 'cascade' }),
		pageId: text('pageId').notNull()
	},
	(CommentTable) => {
		return {
			CommentIndex: index('CommentIndex').on(
				CommentTable.siteId,
				CommentTable.pageId,
				CommentTable.sourceId,
				CommentTable.created,
				CommentTable.text,
				CommentTable.author,
				CommentTable.upvotes
			)
		};
	}
);
export const QueueTable = sqliteTable('QueuedComments', {
	id: integer('id').primaryKey().$defaultFn(generateDendrite),
	siteId: integer('siteId')
		.notNull()
		.references(() => SiteTable.id, { onDelete: 'cascade' }),
	text: text('text').notNull(),
	author: text('author').notNull(),
	authorId: integer('authorId').references(() => UserTable.id, { onDelete: 'set null' }),
	notifications: integer('notifications', { mode: 'boolean' }),
	created: integer('created', { mode: 'timestamp' }).notNull(),
	upvotes: integer('upvotes').default(0),
	sourceId: integer('sourceId').references(idRef, { onDelete: 'cascade' }),
	pageId: text('pageId').notNull()
});
export type CommentTableSelect = InferSelectModel<typeof CommentTable>;
export type CommentTableInsert = InferInsertModel<typeof CommentTable>;
export type QueueTableSelect = InferSelectModel<typeof QueueTable>;
export type QueueTableInsert = InferInsertModel<typeof QueueTable>;
