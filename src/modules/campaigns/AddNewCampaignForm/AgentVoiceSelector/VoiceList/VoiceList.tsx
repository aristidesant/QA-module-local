import { Avatar, Badge, Group, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { AgentVoiceModel } from '~/models/AgentVoiceModel';
import { VoiceMiniPlayer } from '~/components/VoiceMiniPlayer';
import { getLanguageFlagEmoji } from '~/utils/agentUtils';
import classes from './VoiceList.module.css';

type VoiceListProps = {
	voices: AgentVoiceModel[];
	selectedVoiceId?: string;
	onVoiceSelect: (voiceId: string) => void;
};

const VoiceList: React.FC<VoiceListProps> = ({
	voices,
	selectedVoiceId,
	onVoiceSelect,
}) => {
	const { t } = useTranslation('campaigns');

	if (!voices.length) {
		return (
			<div className={classes.emptyState}>
				<Text c='dimmed' size='sm'>
					{t('addNewCampaign.voices.noVoices')}
				</Text>
			</div>
		);
	}

	return (
		<div className={classes.container}>
			<div className={classes.grid}>
				{voices.map((agentVoice) => {
					const { voice } = agentVoice;
					const gender = voice.gender?.toLowerCase() || 'unknown';
					const flagEmoji = getLanguageFlagEmoji(voice.language || '');
					const isSelected = agentVoice.voice.id === selectedVoiceId;

					return (
						<div
							key={voice.id}
							className={`${classes.card} ${
								isSelected ? classes.selectedCard : ''
							}`}
							onClick={() => {
								onVoiceSelect(agentVoice.voice.id);
							}}
						>
							<Group gap='sm' wrap='nowrap'>
								<Avatar
									src={
										gender === 'female'
											? '/images/avatar-f-do.png'
											: '/images/avatar-m-do.png'
									}
									alt={voice.name}
									radius='xl'
									size={48}
									style={{
										border: `2px solid ${
											gender === 'female'
												? 'var(--mantine-color-pink-4)'
												: 'var(--mantine-color-blue-4)'
										}`,
									}}
								/>
								<Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
									<Text
										fw={600}
										size='sm'
										style={{
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											whiteSpace: 'nowrap',
										}}
									>
										{voice.name}
									</Text>
									<Group gap={6}>
										<Text size='xs' c='dimmed'>
											{flagEmoji} {voice.language}
										</Text>
										<Badge
											size='xs'
											variant='light'
											color={gender === 'female' ? 'pink' : 'blue'}
										>
											{voice.gender
												? t(
														`addNewCampaign.voices.${voice.gender.toLowerCase()}`
													)
												: t('addNewCampaign.voices.unknown')}
										</Badge>
									</Group>
								</Stack>
								<div
									onClick={(e) => e.stopPropagation()}
									className={classes.playerContainer}
								>
									<VoiceMiniPlayer
										voiceUrl={voice.previewUrl}
										disabled={!voice.previewUrl}
										size='small'
									/>
								</div>
							</Group>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default VoiceList;
