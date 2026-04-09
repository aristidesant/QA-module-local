import { useEffect, useRef, useState } from 'react';
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

interface CampaignConvaiWidgetProps {
	agentId?: string;
	mode?: 'floating' | 'embedded';
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

const CampaignConvaiWidget = ({
	agentId,
	mode = 'floating',
}: CampaignConvaiWidgetProps) => {
	const { t } = useTranslation('campaign.detail');
	const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
		'loading'
	);
	const [retryIndex, setRetryIndex] = useState(0);
	const widgetHostRef = useRef<HTMLElement | null>(null);
	const isEmbedded = mode === 'embedded';

	useEffect(() => {
		if (!agentId) return;

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
	}, [retryIndex, agentId]);

	useEffect(() => {
		if (status !== 'ready') return;

		const injectShadowStyles = () => {
			const host =
				widgetHostRef.current ??
				(document.querySelector(WIDGET_ELEMENT_NAME) as HTMLElement | null);

			if (!host?.shadowRoot) return false;

			const styleId = isEmbedded
				? 'nai-position-override-embedded'
				: 'nai-position-override';
			if (host.shadowRoot.getElementById(styleId)) return true;

			const style = document.createElement('style');
			style.id = styleId;

			if (isEmbedded) {
				style.textContent = `
          .fixed {
            position: static !important;
            inset: auto !important;
          }

          .fixed.end-3,
          .fixed.bottom-20 {
            inset-inline-end: auto !important;
            inset-inline-start: auto !important;
            right: auto !important;
            left: auto !important;
            bottom: auto !important;
          }
        `;
			} else {
				// Override widget's Tailwind classes that place the card on the right/bottom.
				style.textContent = `
          .fixed.end-3 {
            inset-inline-end: auto !important;
            inset-inline-start: 12px !important;
          }
        `;
			}

			host.shadowRoot.appendChild(style);
			return true;
		};

		if (!injectShadowStyles()) {
			const timer = setTimeout(injectShadowStyles, 300);
			return () => clearTimeout(timer);
		}
	}, [isEmbedded, status]);

	if (!agentId) return null;

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

	const renderStatusCard = () => (
		<Paper
			className={isEmbedded ? styles.embeddedStatus : styles.fallback}
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
	);

	const renderErrorCard = () => (
		<Paper
			className={isEmbedded ? styles.embeddedStatus : styles.fallback}
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
	);

	const renderReadyWidget = () => (
		<div
			className={isEmbedded ? styles.embeddedContent : styles.widgetExpanded}
		>
			<div
				className={isEmbedded ? styles.embeddedHostShell : styles.widgetContent}
				ref={(element) => {
					widgetHostRef.current = element
						? (element.querySelector(WIDGET_ELEMENT_NAME) as HTMLElement | null)
						: null;
				}}
			>
				<elevenlabs-convai
					className={isEmbedded ? styles.embeddedHost : styles.widgetHost}
					agent-id={agentId}
				/>
			</div>
		</div>
	);

	const content = (
		<>
			{status === 'loading' ? renderStatusCard() : null}
			{status === 'error' ? renderErrorCard() : null}
			{status === 'ready' ? renderReadyWidget() : null}
		</>
	);

	if (isEmbedded) {
		return (
			<Paper className={styles.embeddedRoot} radius='lg' shadow='md' withBorder>
				{content}
			</Paper>
		);
	}

	return <Portal>{content}</Portal>;
};

export default CampaignConvaiWidget;
