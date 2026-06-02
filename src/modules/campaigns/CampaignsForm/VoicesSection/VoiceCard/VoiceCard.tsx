import { memo, useCallback } from 'react';
import { ActionIcon, Avatar, Badge, Progress, Text } from '@mantine/core';
import {
	IconCheck,
	IconPlayerPauseFilled,
	IconPlayerPlayFilled,
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

	const detailParts = [voiceData.accent, voiceData.age].filter(Boolean);
	const description = voiceData.description || detailParts.join(' · ');

	return (
		<div
			role='button'
			tabIndex={0}
			onClick={handleToggle}
			onKeyDown={handleCardKeyDown}
			aria-pressed={selected}
			aria-label={selected ? t('card.deselect') : t('card.select')}
			className={clsx(classes.card, {
				[classes.cardSelected]: selected,
				[classes.cardPlaying]: playing,
			})}
		>
			{selected && (
				<span className={classes.checkBadge} aria-hidden='true'>
					<IconCheck size={12} stroke={3} />
				</span>
			)}

			<div className={classes.header}>
				<Avatar
					src={
						genderKey === 'female'
							? '/images/avatar-f-do.png'
							: '/images/avatar-m-do.png'
					}
					alt={voiceData.name}
					radius='xl'
					size={42}
					className={clsx(classes.avatar, {
						[classes.avatarFemale]: genderKey === 'female',
						[classes.avatarMale]: genderKey === 'male',
					})}
				/>

				<div className={classes.body}>
					<Text size='sm' fw={600} className={classes.name}>
						{voiceData.name}
					</Text>
					<div className={classes.meta}>
						<Text size='xs' c='dimmed' className={classes.metaItem}>
							<span className={classes.flag}>{flagEmoji}</span>
							{voiceData.language}
						</Text>
						<Badge
							size='xs'
							variant='light'
							color={
								genderKey === 'female'
									? 'pink'
									: genderKey === 'male'
										? 'blue'
										: 'gray'
							}
							className={classes.genderBadge}
						>
							{genderLabel}
						</Badge>
					</div>
				</div>

				<ActionIcon
					variant={playing ? 'filled' : 'light'}
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
			</div>

			{description && (
				<Text size='xs' c='dimmed' className={classes.description}>
					{description}
				</Text>
			)}

			<div className={classes.progressTrack}>
				{playing && (
					<Progress
						value={progress}
						size='xs'
						color='blue'
						animated
						className={classes.progress}
					/>
				)}
			</div>
		</div>
	);
};

export default memo(VoiceCard);
