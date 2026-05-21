import { type ConvaiStatus } from './CampaignConvaiWidget.types';
import styles from './CampaignConvaiWidget.module.css';

export interface ConvaiVoiceOrbProps {
	status: ConvaiStatus;
	isSpeaking: boolean;
	isListening: boolean;
}

const stageStateClass = (
	status: ConvaiStatus,
	isSpeaking: boolean,
	isListening: boolean
) => {
	if (status === 'connecting') return styles.orbStageConnecting;
	if (status === 'error') return styles.orbStageError;
	if (status === 'connected') {
		if (isSpeaking) return styles.orbStageSpeaking;
		if (isListening) return styles.orbStageListening;
		return styles.orbStageConnected;
	}
	return styles.orbStageIdle;
};

const ConvaiVoiceOrb = ({
	status,
	isSpeaking,
	isListening,
}: ConvaiVoiceOrbProps) => {
	return (
		<div
			className={`${styles.orbStage} ${stageStateClass(status, isSpeaking, isListening)}`}
		>
			<span className={styles.orbField} aria-hidden />
			<span className={styles.orbOrbitOuter} aria-hidden />
			<span className={styles.orbOrbitInner} aria-hidden />
			<span className={styles.orbTrace} aria-hidden />
			<span className={styles.orbCore} aria-hidden />
			<span className={`${styles.orbNode} ${styles.orbNodeTop}`} aria-hidden />
			<span
				className={`${styles.orbNode} ${styles.orbNodeRight}`}
				aria-hidden
			/>
			<span
				className={`${styles.orbNode} ${styles.orbNodeBottom}`}
				aria-hidden
			/>
		</div>
	);
};

export default ConvaiVoiceOrb;
