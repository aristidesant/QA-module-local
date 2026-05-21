import { Alert, Card, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useCampaignConvai } from './CampaignConvaiContext';
import ConvaiHeader from './ConvaiHeader';
import ConvaiTranscript from './ConvaiTranscript';
import ConvaiMessageInput from './ConvaiMessageInput';
import styles from './CampaignConvaiWidget.module.css';

const ConvaiConversationColumn = () => {
	const { t } = useTranslation('campaign.detail.test');
	const {
		status,
		message,
		transcript,
		draftMessage,
		setDraftMessage,
		sendMessage,
	} = useCampaignConvai();

	return (
		<Card className={styles.widgetCard} padding='lg' shadow='md' withBorder>
			<Stack gap='md'>
				<ConvaiHeader
					status={status}
					statusLabel={t(`widget.status.${status}`)}
					labels={{
						title: t('widget.title'),
						description: t('widget.description'),
						helper: t('widget.helper'),
					}}
				/>

				<ConvaiTranscript
					transcript={transcript}
					canCopyTranscript={status !== 'connected'}
					labels={{
						title: t('widget.transcript.title'),
						empty: t('widget.transcript.empty'),
						agent: t('widget.transcript.agent'),
						user: t('widget.transcript.user'),
						copyTranscript: t('widget.transcript.copyTranscript'),
						copiedTranscript: t('widget.transcript.copiedTranscript'),
					}}
				/>

				<ConvaiMessageInput
					value={draftMessage}
					onChange={setDraftMessage}
					onSend={sendMessage}
					disabled={status !== 'connected'}
					labels={{
						inputLabel: t('widget.transcript.inputLabel'),
						inputPlaceholder: t('widget.transcript.inputPlaceholder'),
						send: t('widget.transcript.send'),
					}}
				/>

				{status === 'error' && message && (
					<Alert
						icon={<IconAlertCircle size={16} />}
						color='red'
						variant='light'
						title={t('widget.error.title')}
						className={styles.errorAlert}
					>
						{message}
					</Alert>
				)}
			</Stack>
		</Card>
	);
};

export default ConvaiConversationColumn;
