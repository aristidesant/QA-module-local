import { memo, useCallback } from 'react';
import {
	ActionIcon,
	Avatar,
	Button,
	Group,
	Paper,
	Progress,
	Stack,
	Text,
} from '@mantine/core';
import {
	IconCheck,
	IconPlayerPauseFilled,
	IconPlayerPlayFilled,
	IconPlus,
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

	const handlePlay = useCallback(() => {
		onPlay(voiceData.id, previewUrl);
	}, [onPlay, voiceData.id, previewUrl]);

	return (
		<Paper
			withBorder
			radius='md'
			p='sm'
			component='article'
			className={clsx(classes.card, {
				[classes.cardSelected]: selected,
				[classes.cardPlaying]: playing,
			})}
		>
			<div className={classes.content}>
				<Group gap='sm' wrap='nowrap' className={classes.identity}>
					<Avatar
						src={
							genderKey === 'female'
								? '/images/avatar-f-do.png'
								: '/images/avatar-m-do.png'
						}
						alt={voiceData.name}
						radius='xl'
						size={40}
					/>

					<Stack gap={3} className={classes.copy}>
						<Text size='sm' fw={700} className={classes.name}>
							{voiceData.name}
						</Text>
						<Text size='xs' c='dimmed' className={classes.meta}>
							<span aria-hidden='true'>{flagEmoji}</span>
							{voiceData.language}
							<span className={classes.separator}>·</span>
							{genderLabel}
						</Text>
					</Stack>
				</Group>

				<Group gap='xs' wrap='nowrap' className={classes.actions}>
					<ActionIcon
						variant={playing ? 'light' : 'subtle'}
						color={playing ? 'blue' : 'gray'}
						size='lg'
						disabled={!hasPreview}
						onClick={handlePlay}
						aria-label={playing ? t('card.pause') : t('card.play')}
					>
						{playing ? (
							<IconPlayerPauseFilled size={14} />
						) : (
							<IconPlayerPlayFilled size={14} />
						)}
					</ActionIcon>
					<Button
						type='button'
						variant={selected ? 'light' : 'default'}
						color='green'
						size='xs'
						leftSection={
							selected ? <IconCheck size={14} /> : <IconPlus size={14} />
						}
						onClick={handleToggle}
					>
						{selected ? t('card.added') : t('card.select')}
					</Button>
				</Group>
			</div>

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
