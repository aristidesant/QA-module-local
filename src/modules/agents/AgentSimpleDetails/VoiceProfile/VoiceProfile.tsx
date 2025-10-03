import { Badge, Text } from '@mantine/core';
import AgentVoiceProgress from '../AgentVoiceProgress/AgentVoiceProgress';
import { VoicePlayer } from '~/components/VoicePlayer';
import RightSectionCard from '~/components/RightSectionCard';
import type AgentListObject from '~/models/AgentListObject';
import styles from '../AgentSimpleDetails.module.css';

type VoiceProfileProps = {
	agent: AgentListObject;
};

export const VoiceProfile: React.FC<VoiceProfileProps> = ({ agent }) => {
	const stability = agent?.config?.conversationConfig?.tts?.stability ?? 0;
	const speed = agent?.config?.conversationConfig?.tts?.speed ?? 0;
	const similarityBoost =
		agent?.config?.conversationConfig?.tts?.similarityBoost ?? 0;
	const optimizeLatency =
		agent?.config?.conversationConfig?.tts?.optimizeStreamingLatency ?? 0;

	const voiceName = agent.voice?.name || 'No voice selected';
	const voiceMeta = agent.voice?.language || 'Language not set';

	return (
		<RightSectionCard
			title='Voice Profile'
			rightSection={
				<div className={styles.voiceBadgeGroup}>
					<Badge
						variant='light'
						size='sm'
						color='blue'
						className={styles.cardBadge}
					>
						{voiceName}
					</Badge>
					<Text className={styles.cardMeta}>{voiceMeta}</Text>
				</div>
			}
		>
			<div className={styles.voiceContent}>
				<VoicePlayer
					voiceName={voiceName}
					previewUrl={agent.voice?.previewUrl}
				/>
				<AgentVoiceProgress
					stability={stability}
					speed={speed}
					similarityBoost={similarityBoost}
					optimizeLatency={optimizeLatency}
				/>
			</div>
		</RightSectionCard>
	);
};

export default VoiceProfile;
