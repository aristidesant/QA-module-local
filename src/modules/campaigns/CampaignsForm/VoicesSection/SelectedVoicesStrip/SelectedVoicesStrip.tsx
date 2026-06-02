import { useCallback } from 'react';
import { ActionIcon, Avatar, Group, Loader, Text } from '@mantine/core';
import {
	IconPlayerPauseFilled,
	IconPlayerPlayFilled,
	IconX,
} from '@tabler/icons-react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import type { AgentVoiceModel } from '~/models/AgentVoiceModel';
import { getLanguageFlagEmoji } from '~/utils/agentUtils';
import classes from './SelectedVoicesStrip.module.css';

export interface SelectedVoicesStripProps {
	selectedVoices: AgentVoiceModel[];
	totalSelectedCount: number;
	resolvingMissing: boolean;
	playingVoiceId: string | null;
	onPlay: (voiceId: string, previewUrl: string) => void;
	onRemove: (voiceId: string) => void;
	onClearAll: () => void;
}

const SelectedVoicesStrip: React.FC<SelectedVoicesStripProps> = ({
	selectedVoices,
	totalSelectedCount,
	resolvingMissing,
	playingVoiceId,
	onPlay,
	onRemove,
	onClearAll,
}) => {
	const { t } = useTranslation('campaign.form.voices');

	const handlePlay = useCallback(
		(voiceId: string, previewUrl: string) =>
			(event: React.MouseEvent<HTMLButtonElement>) => {
				event.stopPropagation();
				onPlay(voiceId, previewUrl);
			},
		[onPlay]
	);

	const handleRemove = useCallback(
		(voiceId: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
			event.stopPropagation();
			onRemove(voiceId);
		},
		[onRemove]
	);

	if (totalSelectedCount === 0) {
		return (
			<div className={classes.empty}>
				<Text size='sm' c='dimmed'>
					{t('selected.empty')}
				</Text>
			</div>
		);
	}

	return (
		<div className={classes.strip}>
			<Group justify='space-between' align='center' gap='xs' wrap='nowrap'>
				<Group gap='xs' align='baseline' wrap='nowrap'>
					<Text size='sm' fw={600} className={classes.title}>
						{t('selected.title')}
					</Text>
					<Text size='xs' c='dimmed'>
						{t('selected.count', { count: totalSelectedCount })}
					</Text>
				</Group>
				<button type='button' onClick={onClearAll} className={classes.clearAll}>
					{t('selected.clearAll')}
				</button>
			</Group>

			<div className={classes.chips}>
				{selectedVoices.map(({ voice }) => {
					const genderKey = voice.gender?.toLowerCase() || 'other';
					const flagEmoji = getLanguageFlagEmoji(voice.language || '');
					const previewUrl = voice.previewUrl || '';
					const hasPreview = Boolean(previewUrl);
					const playing = playingVoiceId === voice.id;

					return (
						<div
							key={voice.id}
							className={clsx(classes.chip, {
								[classes.chipPlaying]: playing,
							})}
						>
							<Avatar
								src={
									genderKey === 'female'
										? '/images/avatar-f-do.png'
										: '/images/avatar-m-do.png'
								}
								alt={voice.name}
								radius='xl'
								size={22}
								className={classes.chipAvatar}
							/>
							<span className={classes.chipName}>{voice.name}</span>
							<span className={classes.chipFlag} aria-hidden='true'>
								{flagEmoji}
							</span>
							<ActionIcon
								variant='subtle'
								color={playing ? 'blue' : 'gray'}
								size='sm'
								radius='xl'
								disabled={!hasPreview}
								onClick={handlePlay(voice.id, previewUrl)}
								aria-label={playing ? t('card.pause') : t('selected.play')}
								className={classes.chipAction}
							>
								{playing ? (
									<IconPlayerPauseFilled size={12} />
								) : (
									<IconPlayerPlayFilled size={12} />
								)}
							</ActionIcon>
							<ActionIcon
								variant='subtle'
								color='gray'
								size='sm'
								radius='xl'
								onClick={handleRemove(voice.id)}
								aria-label={t('selected.remove')}
								className={clsx(classes.chipAction, classes.chipRemove)}
							>
								<IconX size={12} />
							</ActionIcon>
						</div>
					);
				})}

				{resolvingMissing && (
					<div className={clsx(classes.chip, classes.chipLoading)}>
						<Loader size={14} />
						<span className={classes.chipName}>…</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default SelectedVoicesStrip;
