function stringToJSONDatatype(str) {
	if (str === 'true' || str === 'false') {
		return !!str;
	}
	return str;
}
function formDataToSubObject(key, value, body = {}) {
	if (key.length > 1) {
		body[key[0]] = formDataToSubObject(key.slice(1), value, body[key[0]] || {});
	}
	value.length > 1
		? (body[key[0]] = value.map(stringToJSONDatatype))
		: (body[key[0]] = stringToJSONDatatype(value[0]));
	return body;
}
export function formDataToObject(formdata: FormData | URLSearchParams) {
	const body = {};
	for (const key of formdata.keys()) {
		if (key.includes('.')) {
			body[key.split('.')[0]] = formDataToSubObject(
				key.split('.').slice(1),
				formdata.getAll(key) /* getall used for arrays */,
				body[key.split('.')[0]] || {}
			);
		} else {
			const value = formdata.getAll(key);
			value.length > 1
				? (body[key] = value.map(stringToJSONDatatype))
				: (body[key] = stringToJSONDatatype(value[0]));
		}
	}
	return body;
}
/**
 * Parses request as JSON or formdata. If JSON, simply alias of request.json(); otherwise, parse formdata to obj using the following format:
 * . in key = subproperty
 * multiple properties with same name = array
 * @param request Request containing data in body
 * @returns Parsed request body
 */
export async function parseRequestBody(
	request: Request
): Promise<Record<string, unknown> | Response> {
	let body = {};
	try {
		if (request.method !== 'GET') {
			switch (request.headers.get('Content-Type').split(';')[0]) {
				case 'application/x-www-form-urlencoded': {
					const formdata = await request.formData();
					body = formDataToObject(formdata);
					break;
				}
				default:
					body = await request.json();
					break;
			}
		} else {
			return formDataToObject(new URL(request.url).searchParams);
		}
	} catch {
		return new Response(
			'Invalid request body; Please make sure the format sent is correct and corresponds to the Content-Type header',
			{
				status: 400
			}
		);
	}
	return body;
}

/**
 * Generate a dendrite (basically a 52 bit snowflake with random ids rather than machine and sequence ids)
 * @param timestamp Timestamp to use. Defaults to Date.now()
 * @returns dendrite
 */
export function generateDendrite(timestamp?: number) {
	// optimize creation using arraybuffer?
	const sec = Math.floor(((timestamp || Date.now()) - import.meta.env.EPOCH) / 1000);
	let dendrite = sec.toString(2);
	dendrite = dendrite.padStart(32, '0');
	dendrite += Math.floor(Math.random() * 2 ** 20)
		.toString(2)
		.padStart(20, '0');

	return parseInt(dendrite, 2);
}
export function extractDendrite(dendrite: number) {
	const strDendrite = dendrite.toString(2);
	const timestamp = new Date(
		parseInt(strDendrite.substring(0, strDendrite.length - 20), 2) * 1000 + +import.meta.env.EPOCH
	);
	return timestamp;
}

export function base64StringToUInt8Array(input: string): Uint8Array {
	return Uint8Array.from(atob(input), (char) => char.charCodeAt(0));
}
