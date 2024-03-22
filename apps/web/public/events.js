export async function trackEvent(name, props) {
	if (/^localhost$|^127(?:\.[0-9]+){0,2}\.[0-9]+$|^(?:0*:)*?:?0*1$/.test(location.hostname)) {
		return;
	}
	try {
		await fetch('/api/event', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				n: name,
				u: location.href,
				d: location.hostname,
				r: document.referrer,
				w: window.innerWidth,
				h: 0,
				p: props ? props : undefined
			})
		});
	} catch {
		return;
	}
}
