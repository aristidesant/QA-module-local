import { useEffect } from 'react';
import { Portal } from '@mantine/core';

const WIDGET_ELEMENT_NAME = 'elevenlabs-convai';
const WIDGET_SCRIPT_ID = 'elevenlabs-convai-widget-embed';
const WIDGET_SCRIPT_SRC =
	'https://unpkg.com/@elevenlabs/convai-widget-embed@0.11.2';

interface CampaignConvaiWidgetProps {
	agentId?: string;
}

let widgetScriptPromise: Promise<void> | null = null;

const loadWidgetScript = () => {
	if (typeof window === 'undefined' || typeof document === 'undefined') {
		return Promise.resolve();
	}

	if (window.customElements.get(WIDGET_ELEMENT_NAME)) {
		return Promise.resolve();
	}

	if (widgetScriptPromise) {
		return widgetScriptPromise;
	}

	const existingScript = document.getElementById(
		WIDGET_SCRIPT_ID
	) as HTMLScriptElement | null;

	if (existingScript) {
		if (
			existingScript.dataset.status === 'loaded' &&
			window.customElements.get(WIDGET_ELEMENT_NAME)
		) {
			return Promise.resolve();
		}

		if (existingScript.dataset.status === 'error') {
			existingScript.remove();
		} else {
			widgetScriptPromise = new Promise((resolve, reject) => {
				existingScript.addEventListener(
					'load',
					async () => {
						try {
							await window.customElements.whenDefined(WIDGET_ELEMENT_NAME);
							existingScript.dataset.status = 'loaded';
							resolve();
						} catch (error) {
							existingScript.dataset.status = 'error';
							widgetScriptPromise = null;
							reject(error);
						}
					},
					{ once: true }
				);
				existingScript.addEventListener(
					'error',
					() => {
						existingScript.dataset.status = 'error';
						widgetScriptPromise = null;
						reject(new Error('Failed to load the ElevenLabs widget script.'));
					},
					{ once: true }
				);
			});

			return widgetScriptPromise;
		}
	}

	const script = document.createElement('script');
	script.id = WIDGET_SCRIPT_ID;
	script.async = true;
	script.type = 'text/javascript';
	script.src = WIDGET_SCRIPT_SRC;
	script.dataset.status = 'loading';

	widgetScriptPromise = new Promise((resolve, reject) => {
		script.addEventListener(
			'load',
			async () => {
				try {
					await window.customElements.whenDefined(WIDGET_ELEMENT_NAME);
					script.dataset.status = 'loaded';
					resolve();
				} catch (error) {
					script.dataset.status = 'error';
					widgetScriptPromise = null;
					reject(error);
				}
			},
			{ once: true }
		);
		script.addEventListener(
			'error',
			() => {
				script.dataset.status = 'error';
				widgetScriptPromise = null;
				reject(new Error('Failed to load the ElevenLabs widget script.'));
			},
			{ once: true }
		);
	});

	document.head.appendChild(script);

	return widgetScriptPromise;
};

const CampaignConvaiWidget = ({ agentId }: CampaignConvaiWidgetProps) => {
	useEffect(() => {
		if (!agentId) return;
		void loadWidgetScript();
	}, [agentId]);

	if (!agentId) return null;

	return (
		<Portal>
			<elevenlabs-convai agent-id={agentId} />
		</Portal>
	);
};

export default CampaignConvaiWidget;
