import { ActionIcon, Alert, Text, Tooltip } from '@mantine/core';
import {
	IconAlertCircle,
	IconMicrophone,
	IconMicrophoneOff,
	IconPhone,
	IconPhoneOff,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useCampaignConvai } from './CampaignConvaiContext';
import ConvaiVoiceOrb from './ConvaiVoiceOrb';
import ConvaiTranscript from './ConvaiTranscript';
import ConvaiMessageInput from './ConvaiMessageInput';
import styles from './CampaignConvaiWidget.module.css';

const ConvaiVoicePanel = () => {
	const { t } = useTranslation('campaign.detail.test');
	const {
		status,
		message,
		isSpeaking,
		isListening,
		isMuted,
		sessionId,
		transcript,
		draftMessage,
		setDraftMessage,
		sendMessage,
		startSession,
		endSession,
		toggleMute,
	} = useCampaignConvai();

	const isConnected = status === 'connected';

	const caption = (() => {
		if (status === 'connected') {
			if (isSpeaking) return t('widget.mode.speaking');
			if (isListening) return t('widget.mode.listening');
			return t('widget.status.connected');
		}
		return t(`widget.status.${status}`);
	})();

	return (
		<div className={styles.voicePanel}>
			<div className={styles.orbCluster}>
				<ConvaiVoiceOrb
					status={status}
					isSpeaking={isSpeaking}
					isListening={isListening}
				/>
				<Tooltip
					label={isConnected ? t('widget.voice.hangupTooltip') : t('widget.voice.callTooltip')}
					position='bottom'
					withArrow
				>
					<ActionIcon
						className={styles.callButton}
						size={52}
						radius='xl'
						color={isConnected ? 'red' : 'green'}
						variant='filled'
						aria-label={
							isConnected
								? t('widget.voice.hangupTooltip')
								: t('widget.voice.callTooltip')
						}
						onClick={isConnected ? endSession : startSession}
					>
						{isConnected ? <IconPhoneOff size={22} /> : <IconPhone size={22} />}
					</ActionIcon>
				</Tooltip>
			</div>

			<Text className={styles.voiceCaption}>{caption}</Text>

			{status === 'error' && message && (
				<Alert
					icon={<IconAlertCircle size={16} />}
					color='red'
					variant='light'
					title={t('widget.error.title')}
					className={styles.voiceErrorAlert}
				>
					{message}
				</Alert>
			)}

			{isConnected && (
				<Tooltip
					label={isMuted ? t('widget.actions.unmute') : t('widget.actions.mute')}
					position='bottom'
					withArrow
				>
					<ActionIcon
						size='lg'
						radius='xl'
						variant='light'
						color={isMuted ? 'red' : 'gray'}
						aria-label={
							isMuted ? t('widget.actions.unmute') : t('widget.actions.mute')
						}
						onClick={toggleMute}
					>
						{isMuted ? (
							<IconMicrophoneOff size={18} />
						) : (
							<IconMicrophone size={18} />
						)}
					</ActionIcon>
				</Tooltip>
			)}

			{sessionId && (
				<Text className={styles.voiceSessionId} title={sessionId}>
					{sessionId}
				</Text>
			)}

			<div className={styles.voiceTranscriptShell}>
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
					disabled={!isConnected}
					labels={{
						inputLabel: t('widget.transcript.inputLabel'),
						inputPlaceholder: t('widget.transcript.inputPlaceholder'),
						send: t('widget.transcript.send'),
					}}
				/>
			</div>
		</div>
	);
};

export default ConvaiVoicePanel;
