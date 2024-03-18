import { onMount } from 'solid-js';
type Props = { site: string; theme?: 'dark' | 'light' | 'auto'; page: string; host?: string };
export default function index({
	site,
	theme,
	page,
	host = 'https://convocomet.dev/widget'
}: Props) {
	let iframe: HTMLIFrameElement;
	const searchparams = new URLSearchParams({
		site,
		page
	});
	onMount(() => {
		window.addEventListener('message', (e) => {
			if (e.data.type === 'resize') {
				iframe.height = e.data.height;
			}
		});
		if (!iframe.contentWindow) throw new Error('No content window found');
		iframe.contentWindow.postMessage(
			{
				type: 'resizerInit'
			},
			'*'
		);
	});
	return (
		<iframe
			ref={iframe}
			loading="lazy"
			style={{
				width: '100%',
				border: '0'
			}}
			title={'Comments by ConvoComet'}
			src={`${host}?${searchparams.toString()}`}
		/>
	);
}
