import { IconMicrophoneOff } from '@tabler/icons-react';
import { type ConvaiStatus } from './CampaignConvaiWidget.types';
import styles from './CampaignConvaiWidget.module.css';

export interface ConvaiAgentAvatarProps {
	status: ConvaiStatus;
	isSpeaking: boolean;
	isListening: boolean;
	isMuted: boolean;
}

const getAvatarClass = (
	status: ConvaiStatus,
	isSpeaking: boolean,
	isListening: boolean
) => {
	if (status === 'connecting') return styles.avatarConnecting;
	if (status === 'error') return styles.avatarError;
	if (status === 'connected') {
		if (isSpeaking) return styles.avatarSpeaking;
		if (isListening) return styles.avatarListening;
		return styles.avatarConnected;
	}
	return styles.avatarIdle;
};

const ConvaiAgentAvatar = ({
	status,
	isSpeaking,
	isListening,
	isMuted,
}: ConvaiAgentAvatarProps) => {
	const avatarClass = getAvatarClass(status, isSpeaking, isListening);

	return (
		<div className={`${styles.agentAvatar} ${avatarClass}`}>
			<div className={styles.avatarEyes}>
				<span className={styles.avatarEye} />
				<span className={styles.avatarEye} />
			</div>
			<div className={styles.avatarMouth} />
			{isMuted && status === 'connected' && (
				<div className={styles.avatarMuteBadge}>
					<IconMicrophoneOff size={10} stroke={2.5} />
				</div>
			)}
		</div>
	);
};

export default ConvaiAgentAvatar;
