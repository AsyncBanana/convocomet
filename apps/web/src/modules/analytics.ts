function generateQueryWhere(id) {
	return `index1 = '${(+id).toString() /* just an extra precaution :) */}'`;
}
export enum Period {
	BillingMonth = 0,
	Last30Days = 1
}
export enum Interval {
	None = 0,
	Day = 1
}
export type AnalyticsResult = Record<number, [number, number][]>;
export type AggregatedResult = Record<number, number>;
interface RawQueryResult {
	site_id: string;
	count: string;
}
interface RawQueryResultWithTime extends RawQueryResult {
	time: string;
}
const intervalLength = [undefined, 86400 /* day */];

export async function getEventCount(
	event: 'comment' | 'view',
	siteIds: number | number[],
	{ period = Period.Last30Days, interval = Interval.None } = {}
): Promise<AnalyticsResult> {
	const res = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${
			import.meta.env.CLOUDFLARE_ACCOUNT_ID
		}/analytics_engine/sql`,
		{
			method: 'POST',
			headers: {
				authorization: `Bearer ${import.meta.env.ANALYTICS_TOKEN}`
			},
			body: `SELECT
			index1 AS site_id,${
				interval === Interval.None
					? ''
					: `
			intDiv(toUInt32(timestamp), ${intervalLength[period]}) * ${intervalLength[period]} AS time,`
			}
			sum(_sample_interval) AS count
			FROM
		  CONVOCOMET_${event.toUpperCase()}_ANALYTICS
			WHERE ${
				Array.isArray(siteIds)
					? siteIds.map(generateQueryWhere).join(`
				OR `)
					: generateQueryWhere(siteIds)
			}
				AND timestamp > ${
					period === Period.Last30Days
						? `NOW() - INTERVAL '1' MONTH`
						: `toStartOfInterval(NOW(), INTERVAL '1' MONTH)`
				}
		  GROUP BY site_id${
				interval === Interval.None
					? ''
					: `, time
		  ORDER BY site_id, time`
			}`
		}
	);
	if (!res.ok) {
		throw new Error(`Error running analytics query: ${await res.text()}`);
	}
	const eventData: AnalyticsResult = {};
	for (const eventCount of (
		(await res.json()) as {
			data: (RawQueryResult | RawQueryResultWithTime)[];
			meta: {
				name: string;
				type: string;
			}[];
		}
	).data) {
		const time = 'time' in eventCount ? +eventCount.time : Date.now();
		if (Array.isArray(eventData[eventCount.site_id])) {
			eventData[eventCount.site_id].push([time, +eventCount.count]);
			continue;
		}
		eventData[eventCount.site_id] = [[time, +eventCount.count]];
	}
	return eventData;
}
/**
 * Turn a group of time ordered results into a single value per siteId. Optimally, there is only one non time ordered value (see `Interval` above), but there is still transformation needed to simplify the array
 * @param results results from `getEventCount()`
 * @returns Results simplified to simple object with siteIds leading to event counts
 */
export function aggregateEvents(results: AnalyticsResult): AggregatedResult {
	const sum = {};
	for (const siteId in results) {
		sum[siteId] = 0;
		for (const i in results[siteId]) {
			sum[siteId] += results[siteId][i][1];
		}
	}
	return sum;
}
