import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
	HoverCard,
	Group,
	Avatar,
	Text,
	Badge,
	ActionIcon,
	Divider,
	Stack,
	Progress,
} from '@mantine/core';
import {
	IconPlayerPauseFilled,
	IconPlayerPlayFilled,
	IconVolume,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import type { AgentVoiceModel } from '~/models/AgentVoiceModel';
import { getLanguageFlagEmoji } from '~/utils/agentUtils';
import classes from './VoiceList.module.css';

type UseAgentVoicesColumnsParams = {
	onPlayVoice: (voiceId: string, previewUrl: string) => void;
	playingVoiceId: string | null;
	playProgress: number;
};

export const useAgentVoicesColumns = ({
	onPlayVoice,
	playingVoiceId,
	playProgress,
}: UseAgentVoicesColumnsParams): ColumnDef<AgentVoiceModel>[] => {
	const { t } = useTranslation('campaigns');

	return useMemo(
		() => [
			{
				accessorKey: 'voice',
				header: t('addNewCampaign.voices.voice'),
				cell: ({ row }) => {
					const { voice } = row.original;
					const gender = voice.gender?.toLowerCase() || 'unknown';
					const flagEmoji = getLanguageFlagEmoji(voice.language || '');
					const previewUrl = voice.previewUrl || '';

					return (
						<HoverCard
							position='right'
							shadow='md'
							withinPortal
							openDelay={200}
							closeDelay={100}
						>
							<HoverCard.Target>
								<Group gap='md' className={classes.voiceCell}>
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
											border: `2px solid ${gender === 'female' ? 'var(--mantine-color-pink-4)' : 'var(--mantine-color-blue-4)'}`,
										}}
									/>
									<Stack gap={4} className={classes.voiceTextGroup}>
										<Text fw={700} size='sm'>
											{voice.name}
										</Text>
										<Group gap={8}>
											<Text size='xs' c='dimmed'>
												{flagEmoji} {voice.language}
											</Text>
											<Badge
												size='xs'
												variant='light'
												color={gender === 'female' ? 'pink' : 'blue'}
											>
												{t(`addNewCampaign.voices.${gender}`)}
											</Badge>
										</Group>
									</Stack>
									{previewUrl && (
										<IconVolume
											size={16}
											style={{
												color: 'var(--mantine-color-gray-5)',
												opacity: 0.7,
											}}
										/>
									)}
								</Group>
							</HoverCard.Target>
							<HoverCard.Dropdown className={classes.hoverCard}>
								<Group align='center' gap='sm'>
									<Avatar
										src={
											gender === 'female'
												? '/images/avatar-f-do.png'
												: '/images/avatar-m-do.png'
										}
										alt={voice.name}
										radius='xl'
										size={32}
									/>
									<Stack gap={2}>
										<Text fw={600} size='sm'>
											{voice.name}
										</Text>
										<Text size='xs' c='dimmed'>
											{voice.language} • {t(`addNewCampaign.voices.${gender}`)}
										</Text>
									</Stack>
								</Group>
								<Divider my='xs' />
								<Text size='sm' c='dimmed' style={{ lineHeight: 1.4 }}>
									{voice.description ||
										t('addNewCampaign.voices.noDescription')}
								</Text>
								<Group gap='xs' wrap='wrap' mt='xs'>
									{voice.accent && (
										<Badge size='xs' variant='dot' color='teal'>
											{voice.accent}
										</Badge>
									)}
									{voice.age && (
										<Badge size='xs' variant='dot' color='orange'>
											{t('addNewCampaign.voices.age', { age: voice.age })}
										</Badge>
									)}
									{voice.status && (
										<Badge size='xs' variant='dot' color='green'>
											{voice.status}
										</Badge>
									)}
								</Group>
								{previewUrl && (
									<Text
										size='xs'
										c='blue'
										mt='xs'
										style={{ fontStyle: 'italic' }}
									>
										{t('addNewCampaign.voices.previewHint')}
									</Text>
								)}
							</HoverCard.Dropdown>
						</HoverCard>
					);
				},
			},
			{
				id: 'controls',
				header: t('addNewCampaign.voices.preview'),
				cell: ({ row }) => {
					const { voice } = row.original;
					const previewUrl = voice.previewUrl || '';
					const isPlaying = playingVoiceId === voice.id;

					return (
						<Group gap='sm' className={classes.controlCell} align='center'>
							<ActionIcon
								variant={isPlaying ? 'filled' : 'light'}
								color={isPlaying ? 'blue' : 'gray'}
								size='md'
								radius='xl'
								aria-label={
									isPlaying
										? t('addNewCampaign.voices.pauseAria')
										: t('addNewCampaign.voices.playAria')
								}
								disabled={!previewUrl}
								onClick={(event) => {
									event.stopPropagation();
									onPlayVoice(voice.id, previewUrl);
								}}
							>
								{isPlaying ? (
									<IconPlayerPauseFilled size={16} />
								) : (
									<IconPlayerPlayFilled size={16} />
								)}
							</ActionIcon>
							<div style={{ flex: 1, maxWidth: '80px' }}>
								<Progress
									value={isPlaying ? playProgress : 0}
									size='sm'
									color={isPlaying ? 'blue' : 'gray'}
									animated={isPlaying}
									style={{
										opacity: previewUrl ? 1 : 0.3,
									}}
								/>
							</div>
						</Group>
					);
				},
			},
		],
		[onPlayVoice, playingVoiceId, playProgress, t]
	);
};
