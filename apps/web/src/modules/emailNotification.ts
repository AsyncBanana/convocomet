import { type CommentTableSelect, CommentTable } from '../schemas/db/comment';
import { eq } from 'drizzle-orm';
import replyNotificationTemplate from '../templates/html/replyNotification.html?raw';
import moderationNotificationTemplate from '../templates/html/commentModeration.html?raw';
import { sendEmail } from './email';
import type { SiteTableSelect } from '../schemas/db/site';
import { UserTable as UserTable } from '../schemas/db/auth';
import type { APIContext } from 'astro';

export async function replyNotification(
	replyComment: CommentTableSelect,
	siteConfig: SiteTableSelect,
	{ locals: { db }, site }: APIContext
) {
	if (!replyComment.sourceId) return;
	const parentComment = await db
		.select()
		.from(CommentTable)
		.where(eq(CommentTable.id, replyComment.sourceId))
		.get();
	if (!parentComment.notifications) return;
	const res = await sendEmail({
		from: { email: 'notifications@convocomet.dev', name: 'ConvoComet Notifications' },
		personalizations: {
			to: [{ name: parentComment.author, email: parentComment.email }]
		},
		subject: `${replyComment.author} has responded to your comment!`,
		content: [
			{
				type: 'text/html',
				value: replyNotificationTemplate
					.replaceAll('{{replyAuthor}}', replyComment.author)
					.replaceAll('{{content}}', replyComment.text)
					.replaceAll(
						'{{unsubscribeUrl}}',
						new URL(
							`/email/unsubscribe?email=${encodeURIComponent(
								parentComment.email
							)}&comment=${encodeURIComponent(parentComment.id)}`,
							site
						).toString()
					)
					.replaceAll('{{siteName}}', siteConfig.name)
			}
		]
	});
}
export async function moderationNotification(
	comment: CommentTableSelect,
	siteConfig: SiteTableSelect,
	{ locals: { db }, site }: APIContext
) {
	if (!siteConfig.manualModeration) return;
	const { email, name } = await db
		.select({ email: UserTable.email, name: UserTable.name })
		.from(UserTable)
		.where(eq(UserTable.id, siteConfig.owner))
		.get();
	const res = await sendEmail({
		from: { email: 'notifications@convocomet.dev', name: 'ConvoComet Notifications' },
		personalizations: {
			to: [{ name: name || siteConfig.name, email }]
		},
		subject: `${comment.author} has posted a comment pending moderation in ${siteConfig.name}`,
		content: [
			{
				type: 'text/html',
				value: moderationNotificationTemplate
					.replaceAll('{{author}}', comment.author)
					.replaceAll('{{content}}', comment.text)
					.replaceAll('{{siteName}}', siteConfig.name)
					.replaceAll(
						'{{approveUrl}}',
						new URL(`/api/comment/${siteConfig.id}/approve?comment=${comment.id}`, site).toString()
					)
					.replaceAll(
						'{{rejectUrl}}',
						new URL(`/api/comment/${siteConfig.id}/deny?comment=${comment.id}`, site).toString()
					)
			}
		]
	});
}
