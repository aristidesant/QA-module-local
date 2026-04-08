import { useEffect, useState } from 'react';
import {
	Button,
	Group,
	Loader,
	Paper,
	Portal,
	Stack,
	Text,
	ThemeIcon,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import styles from './CampaignConvaiWidget.module.css';

const WIDGET_ELEMENT_NAME = 'elevenlabs-convai';
const WIDGET_SCRIPT_ID = 'elevenlabs-convai-widget-embed';
const WIDGET_SCRIPT_SRC =
	'https://unpkg.com/@elevenlabs/convai-widget-embed@0.11.2';
const WIDGET_AGENT_ID = 'agent_7401kn0y3svqej39hn0pa7khsdr3';

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
		const existingStatus = existingScript.dataset.status;

		if (
			existingStatus === 'loaded' &&
			window.customElements.get(WIDGET_ELEMENT_NAME)
		) {
			return Promise.resolve();
		}

		if (existingStatus === 'error') {
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

const CampaignConvaiWidget = () => {
	const { t } = useTranslation('campaign.detail');
	const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
		'loading'
	);
	const [retryIndex, setRetryIndex] = useState(0);

	useEffect(() => {
		let cancelled = false;

		const bootstrapWidget = async () => {
			setStatus('loading');

			try {
				await loadWidgetScript();

				if (!cancelled) {
					setStatus('ready');
				}
			} catch {
				if (!cancelled) {
					setStatus('error');
				}
			}
		};

		void bootstrapWidget();

		return () => {
			cancelled = true;
		};
	}, [retryIndex]);

	const handleRetry = () => {
		const script = document.getElementById(
			WIDGET_SCRIPT_ID
		) as HTMLScriptElement | null;

		if (script?.dataset.status === 'error') {
			script.remove();
		}

		widgetScriptPromise = null;
		setRetryIndex((current) => current + 1);
	};

	return (
		<Portal>
			{status === 'loading' ? (
				<Paper
					className={styles.fallback}
					radius='lg'
					shadow='md'
					withBorder
					p='md'
				>
					<Stack gap='xs'>
						<Group gap='xs' wrap='nowrap'>
							<ThemeIcon variant='light' color='blue' size='sm' radius='xl'>
								<Loader size={12} />
							</ThemeIcon>
							<Text fw={600} size='sm'>
								{t('convaiWidget.loading.title')}
							</Text>
						</Group>
						<Text size='xs' c='dimmed'>
							{t('convaiWidget.loading.description')}
						</Text>
					</Stack>
				</Paper>
			) : null}

			{status === 'error' ? (
				<Paper
					className={styles.fallback}
					radius='lg'
					shadow='md'
					withBorder
					p='md'
				>
					<Stack gap='sm'>
						<Group gap='xs' wrap='nowrap'>
							<ThemeIcon variant='light' color='red' size='sm' radius='xl'>
								<IconAlertCircle size={12} />
							</ThemeIcon>
							<Text fw={600} size='sm'>
								{t('convaiWidget.error.title')}
							</Text>
						</Group>
						<Text size='xs' c='dimmed'>
							{t('convaiWidget.error.description')}
						</Text>
						<Group justify='flex-end'>
							<Button size='xs' variant='light' onClick={handleRetry}>
								{t('convaiWidget.retry')}
							</Button>
						</Group>
					</Stack>
				</Paper>
			) : null}

			{status === 'ready' ? (
				<elevenlabs-convai
					className={styles.widgetHost}
					agent-id={WIDGET_AGENT_ID}
				/>
			) : null}
		</Portal>
	);
};

export default CampaignConvaiWidget;
