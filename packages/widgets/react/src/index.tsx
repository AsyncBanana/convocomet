import { useEffect, useRef } from 'react';

type Props = { site: string; theme?: 'dark' | 'light' | 'auto'; page: string; host?: string };
export default function index({
	site,
	theme,
	page,
	host = 'https://convocomet.dev/widget'
}: Props) {
	useEffect(() => {
		window.addEventListener('message', (e) => {
			if (e.data.type === 'resize') {
				iframe.current.height = e.data.height;
			}
		});
		iframe.current.contentWindow.postMessage(
			{
				type: 'resizerInit'
			},
			'*'
		);
	}, []);
	const iframe = useRef(null) as {
		current: HTMLIFrameElement;
	};
	const searchparams = new URLSearchParams({
		site,
		page
	});
	if (theme) searchparams.append('theme', theme);
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
