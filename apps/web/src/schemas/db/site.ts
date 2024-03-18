import { sqliteTable, integer, customType, text, index } from 'drizzle-orm/sqlite-core';
import { type SQL, sql, type InferSelectModel } from 'drizzle-orm';
import { generateDendrite } from '../../modules/utils';
import { UserTable } from './auth';

const json = <TData>(name: string) =>
	customType<{ data: TData; driverData: string }>({
		dataType() {
			return 'text';
		},
		toDriver(value: TData): SQL<unknown> {
			return sql`json(${JSON.stringify(value)})`;
		},
		fromDriver(value: string) {
			return JSON.parse(value);
		}
	})(name);
const SiteTable = sqliteTable(
	'Sites',
	{
		id: integer('id').primaryKey().$defaultFn(generateDendrite),
		name: text('name').notNull(),
		owner: integer('owner')
			.notNull()
			.references(() => UserTable.id),
		manualModeration: integer('manualModeration', { mode: 'boolean' }),
		spamFilter: integer('spamFilter', { mode: 'boolean' }),
		upvoteEnabled: integer('upvoteEnabled', { mode: 'boolean' }),
		requireSignIn: integer('requireSignIn', { mode: 'boolean' }),
		domainAllowList: json<string[]>('domainAllowList')
	},
	(SiteTable) => {
		return {
			OwnerIndex: index('OwnerIndex').on(SiteTable.owner, SiteTable.name)
		};
	}
);
export { SiteTable };
export type SiteTableSelect = InferSelectModel<typeof SiteTable>;
