// stolen from https://github.com/cloudflare/pages-plugins/tree/main/packages/mailchannels
interface EmailAddress {
	email: string;
	name?: string;
}

export interface Personalization {
	to: [EmailAddress, ...EmailAddress[]];
	from?: EmailAddress;
	dkim_domain?: string;
	dkim_private_key?: string;
	dkim_selector?: string;
	reply_to?: EmailAddress;
	cc?: EmailAddress[];
	bcc?: EmailAddress[];
	subject?: string;
	headers?: Record<string, string>;
}

export interface ContentItem {
	type: string;
	value: string;
}

export interface MailSendBody {
	personalizations: [Personalization, ...Personalization[]] | Personalization;
	from: EmailAddress;
	reply_to?: EmailAddress;
	subject: string;
	content: [ContentItem, ...ContentItem[]];
	headers?: Record<string, string>;
}

interface Success {
	success: true;
}

interface Failure {
	success: false;
	errors: string[];
}

export const sendEmail = async (payload: MailSendBody): Promise<Success | Failure> => {
	if (!Array.isArray(payload.personalizations)) {
		payload.personalizations = [payload.personalizations];
	}
	payload.personalizations = [
		{
			dkim_domain: 'convocomet.dev',
			dkim_selector: 'mail',
			dkim_private_key: import.meta.env.DKIM_PRIVATE_KEY,
			...payload.personalizations[0]
		}
	];
	const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});

	if (response.status === 202) return { success: true };

	try {
		// @ts-expect-error
		const { errors } = await response.json();
		return { success: false, errors };
	} catch {
		return { success: false, errors: [response.statusText] };
	}
};
