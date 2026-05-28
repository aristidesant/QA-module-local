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
					<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
						<path d="M11 5L6 9H2v6h4l5 4V5z" />
						<line x1="23" y1="9" x2="17" y2="15" />
						<line x1="17" y1="9" x2="23" y2="15" />
					</svg>
				</div>
			)}
		</div>
	);
};

export default ConvaiAgentAvatar;
