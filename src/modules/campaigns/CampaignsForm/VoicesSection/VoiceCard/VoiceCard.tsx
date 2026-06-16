import { memo, useCallback } from 'react';
import {
	ActionIcon,
	Avatar,
	Badge,
	Button,
	Group,
	Paper,
	Progress,
	Stack,
	Text,
} from '@mantine/core';
import {
	IconPlayerPauseFilled,
	IconPlayerPlayFilled,
	IconPlus,
	IconCheck,
} from '@tabler/icons-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import type { AgentVoiceModel } from '~/models/AgentVoiceModel';
import { getLanguageFlagEmoji } from '~/utils/agentUtils';
import classes from './VoiceCard.module.css';

export interface VoiceCardProps {
	voice: AgentVoiceModel;
	selected: boolean;
	playing: boolean;
	progress: number;
	onToggle: (voiceId: string) => void;
	onPlay: (voiceId: string, previewUrl: string) => void;
}

const VoiceCard: React.FC<VoiceCardProps> = ({
	voice,
	selected,
	playing,
	progress,
	onToggle,
	onPlay,
}) => {
	const { t } = useTranslation('campaign.form.voices');
	const voiceData = voice.voice;
	const genderKey = voiceData.gender?.toLowerCase() || 'other';
	const genderLabel =
		genderKey === 'female' || genderKey === 'male'
			? t(`gender.${genderKey}`)
			: t('gender.other');
	const flagEmoji = getLanguageFlagEmoji(voiceData.language || '');
	const previewUrl = voiceData.previewUrl || '';
	const hasPreview = Boolean(previewUrl);
	const detailParts = [voiceData.accent, voiceData.age].filter(Boolean);
	const description = voiceData.description || detailParts.join(' · ');

	const handleToggle = useCallback(() => {
		onToggle(voiceData.id);
	}, [onToggle, voiceData.id]);

	const handlePlay = useCallback(
		(event: React.MouseEvent) => {
			event.stopPropagation();
			onPlay(voiceData.id, previewUrl);
		},
		[onPlay, voiceData.id, previewUrl]
	);

	const handleCardKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>) => {
			if (event.key === ' ' || event.key === 'Enter') {
				event.preventDefault();
				handleToggle();
			}
		},
		[handleToggle]
	);

	return (
		<Paper
			withBorder
			radius='md'
			p='sm'
			component='div'
			onClick={handleToggle}
			onKeyDown={handleCardKeyDown}
			role='button'
			tabIndex={0}
			aria-pressed={selected}
			aria-label={selected ? t('card.deselect') : t('card.select')}
			className={clsx(classes.card, {
				[classes.cardSelected]: selected,
				[classes.cardPlaying]: playing,
			})}
		>
			<Group gap='sm' wrap='nowrap' align='flex-start' className={classes.row}>
				<ActionIcon
					variant={playing ? 'filled' : 'subtle'}
					color={playing ? 'blue' : 'gray'}
					size='md'
					radius='xl'
					disabled={!hasPreview}
					onClick={handlePlay}
					aria-label={playing ? t('card.pause') : t('card.play')}
					className={classes.playButton}
				>
					{playing ? (
						<IconPlayerPauseFilled size={14} />
					) : (
						<IconPlayerPlayFilled size={14} />
					)}
				</ActionIcon>

				<Avatar
					src={
						genderKey === 'female'
							? '/images/avatar-f-do.png'
							: '/images/avatar-m-do.png'
					}
					alt={voiceData.name}
					radius='xl'
					size={40}
					className={clsx(classes.avatar, {
						[classes.avatarFemale]: genderKey === 'female',
						[classes.avatarMale]: genderKey === 'male',
					})}
				/>

				<Stack gap={4} className={classes.body}>
					<Group gap={6} wrap='nowrap'>
						<Text size='sm' fw={700} className={classes.name}>
							{voiceData.name}
						</Text>
						{selected && (
							<Badge size='xs' variant='light' color='green'>
								{t('card.selectedBadge')}
							</Badge>
						)}
					</Group>

					<Text size='xs' c='dimmed' className={classes.metaItem}>
						<span className={classes.flag}>{flagEmoji}</span>
						{voiceData.language}
						<span className={classes.metaSeparator}>·</span>
						{genderLabel}
					</Text>

					{description && (
						<Text size='xs' c='dimmed' className={classes.description}>
							{description}
						</Text>
					)}
				</Stack>

				<div className={classes.actions}>
					{voiceData.status && (
						<Text size='xs' c='dimmed' className={classes.status}>
							{voiceData.status}
						</Text>
					)}
					<Button
						type='button'
						variant={selected ? 'light' : 'filled'}
						color={selected ? 'teal' : 'green'}
						size='xs'
						leftSection={
							selected ? <IconCheck size={14} /> : <IconPlus size={14} />
						}
						onClick={(event) => {
							event.stopPropagation();
							handleToggle();
						}}
						className={classes.toggleButton}
					>
						{selected ? t('card.added') : t('card.select')}
					</Button>
				</div>
			</Group>

			{playing && (
				<Progress
					value={progress}
					size='xs'
					color='blue'
					animated
					className={classes.progress}
				/>
			)}
		</Paper>
	);
};

export default memo(VoiceCard);
