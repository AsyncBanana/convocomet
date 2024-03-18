const init = () => {
	const widget = document.getElementById('convocomet-widget');
	const site = widget.getAttribute('data-site');
	const page = widget.getAttribute('data-page');
	const host = widget.getAttribute('data-host') || 'https://convocomet.dev/widget';
	const theme = (widget.getAttribute('data-theme') || 'light') as 'light' | 'dark' | 'auto';
	if (!site || !page) {
		throw new Error('Account Id or Page not specified. See documentation for how to specify');
	}
	const iframe = document.createElement('iframe');
	const params = new URLSearchParams({
		page,
		site
	});
	if (theme) params.append('theme', theme);
	iframe.src = `${host}?${params.toString()}`;
	iframe.style.width = '100%';
	iframe.style.border = '0';
	iframe.style.backgroundColor = 'transparent';
	iframe.title = 'Comments by ConvoComet';
	iframe.loading = 'lazy';
	if (!widget) {
		throw new Error('No widget location specified. Create an element with id convocomet-widget');
	}
	widget.appendChild(iframe);
	window.addEventListener('message', (e) => {
		if (e.data.type === 'resize') {
			iframe.height = e.data.height;
		}
	});
	iframe.contentWindow.postMessage(
		{
			type: 'resizerInit'
		},
		'*'
	);
};
if (document.readyState === 'loading') {
	document.addEventListener(
		'DOMContentLoaded',
		() => {
			init();
		},
		{ once: true }
	);
} else {
	init();
}
