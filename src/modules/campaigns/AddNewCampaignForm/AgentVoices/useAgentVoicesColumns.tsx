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

import type { AgentVoiceModel } from '~/models/AgentVoiceModel';
import { getLanguageFlagEmoji } from '~/utils/agentUtils';
import classes from './AgentVoices.module.css';

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
	return useMemo(
		() => [
			{
				accessorKey: 'voice',
				header: 'Voice',
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
								<Group
									gap='md'
									className={classes.voiceCell}
									p='sm'
									style={{
										borderRadius: '8px',
										transition: 'background-color 0.2s ease',
										cursor: 'pointer',
									}}
								>
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
									<Stack
										gap={4}
										className={classes.voiceTextGroup}
										style={{ flex: 1 }}
									>
										<Text
											fw={700}
											size='sm'
											className={classes.voiceName}
											style={{ color: 'var(--mantine-color-dark-7)' }}
										>
											{voice.name}
										</Text>
										<Group gap={8} className={classes.voiceLanguage}>
											<Text size='xs' c='dimmed' style={{ fontWeight: 500 }}>
												{flagEmoji} {voice.language}
											</Text>
											<Badge
												size='xs'
												variant='light'
												color={gender === 'female' ? 'pink' : 'blue'}
												style={{ fontSize: '10px' }}
											>
												{voice.gender ?? 'Unknown'}
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
											{voice.language} • {voice.gender ?? 'Unknown'}
										</Text>
									</Stack>
								</Group>
								<Divider className={classes.hoverCardDivider} />
								<Text size='sm' c='dimmed' style={{ lineHeight: 1.4 }}>
									{voice.description ||
										'This voice does not include a description yet.'}
								</Text>
								<Group gap='xs' wrap='wrap' mt='xs'>
									{voice.accent && (
										<Badge size='xs' variant='dot' color='teal'>
											{voice.accent}
										</Badge>
									)}
									{voice.age && (
										<Badge size='xs' variant='dot' color='orange'>
											Age: {voice.age}
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
										🎵 Click the play button to preview this voice
									</Text>
								)}
							</HoverCard.Dropdown>
						</HoverCard>
					);
				},
				meta: {
					cellClassName: classes.voiceCellWrapper,
				},
			},
			{
				id: 'controls',
				header: 'Preview',
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
									isPlaying ? 'Pause voice preview' : 'Play voice preview'
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
				meta: {
					cellClassName: classes.controlCellWrapper,
				},
			},
		],
		[onPlayVoice, playingVoiceId, playProgress]
	);
};
