import {
	ActionIcon,
	Alert,
	Button,
	Select,
	Text,
	Tooltip,
} from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import {
	IconAlertCircle,
	IconMicrophone,
	IconMicrophoneOff,
	IconPhone,
	IconPhoneOff,
	IconRefresh,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useCampaignConvai } from './CampaignConvaiContext';
import ConvaiAgentAvatar from './ConvaiAgentAvatar';
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
		transcript,
		draftMessage,
		setDraftMessage,
		sendMessage,
		startSession,
		endSession,
		toggleMute,
		voices,
		selectedVoiceId,
		setSelectedVoiceId,
	} = useCampaignConvai();

	const isConnected = status === 'connected';
	const isConnecting = status === 'connecting';

	useHotkeys([
		[
			'm',
			() => {
				if (isConnected) toggleMute();
			},
		],
		[
			'Escape',
			() => {
				if (isConnected) endSession();
			},
		],
	]);

	const caption = (() => {
		if (status === 'connected') {
			if (isSpeaking) return t('widget.mode.speaking');
			if (isListening) return t('widget.mode.listening');
			return t('widget.status.connected');
		}
		return t(`widget.status.${status}`);
	})();

	const callButtonLabel = isConnected
		? t('widget.voice.hangupTooltip')
		: t('widget.voice.callTooltip');

	const callButtonClassName = `${styles.callButton}${isConnecting ? ` ${styles.callButtonConnecting}` : ''}`;

	return (
		<div className={styles.voicePanel}>
			<div className={styles.agentHeader}>
				<ConvaiAgentAvatar
					status={status}
					isSpeaking={isSpeaking}
					isListening={isListening}
					isMuted={isMuted}
				/>

				<div className={styles.agentHeaderInfo}>
					<Text className={styles.agentName}>{t('widget.voice.title')}</Text>
					<Text className={styles.agentStatus}>{caption}</Text>
				</div>

				<div className={styles.agentHeaderControls}>
					{isConnected && (
						<Tooltip
							label={`${isMuted ? t('widget.actions.unmute') : t('widget.actions.mute')} (M)`}
							position='bottom'
							withArrow
						>
							<ActionIcon
								size='lg'
								radius='xl'
								variant='light'
								color={isMuted ? 'red' : 'gray'}
								aria-label={
									isMuted
										? t('widget.actions.unmute')
										: t('widget.actions.mute')
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

					<Tooltip label={callButtonLabel} position='bottom' withArrow>
						<ActionIcon
							className={callButtonClassName}
							size='lg'
							radius='xl'
							color={isConnected ? 'red' : 'green'}
							variant='filled'
							aria-label={callButtonLabel}
							onClick={isConnected ? endSession : startSession}
							disabled={isConnecting}
						>
							{isConnected ? (
								<IconPhoneOff size={20} />
							) : (
								<IconPhone size={20} />
							)}
						</ActionIcon>
					</Tooltip>
				</div>
			</div>

			{voices.length > 0 && (
				<div className={styles.voiceSelector}>
					<Select
						data={voices.map((v) => ({
							value: v.voiceId,
							label: v.voiceName,
						}))}
						value={selectedVoiceId}
						onChange={(value) => setSelectedVoiceId(value ?? null)}
						disabled={isConnected}
						clearable={false}
						label={t('widget.voice.selectVoice')}
						size='sm'
					/>
				</div>
			)}

			{status === 'error' && message && (
				<Alert
					icon={<IconAlertCircle size={16} />}
					color='red'
					variant='light'
					title={t('widget.error.title')}
					className={styles.voiceErrorAlert}
				>
					<Text size='sm'>{message}</Text>
					<Button
						size='xs'
						variant='light'
						color='green'
						leftSection={<IconRefresh size={14} />}
						onClick={startSession}
						className={styles.errorRetryButton}
					>
						{t('widget.error.retry')}
					</Button>
				</Alert>
			)}

			<ConvaiTranscript
				transcript={transcript}
				canCopyTranscript={transcript.length > 0}
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
	);
};

export default ConvaiVoicePanel;
