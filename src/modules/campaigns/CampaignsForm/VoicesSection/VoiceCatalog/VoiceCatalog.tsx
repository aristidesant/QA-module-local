import { Alert, Center, Loader, Paper, Text } from '@mantine/core';
import { IconAlertCircle, IconMoodEmpty } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { AgentVoiceModel } from '~/models/AgentVoiceModel';
import VoiceCard from '../VoiceCard';
import classes from './VoiceCatalog.module.css';

export interface VoiceCatalogProps {
	id?: string;
	voices: AgentVoiceModel[];
	totalAvailable: number;
	isLoading: boolean;
	isError: boolean;
	selectedVoiceIds: Set<string>;
	playingVoiceId: string | null;
	progress: number;
	onToggleVoice: (voiceId: string) => void;
	onPlayVoice: (voiceId: string, previewUrl: string) => void;
	onResetFilters: () => void;
}

const VoiceCatalog: React.FC<VoiceCatalogProps> = ({
	id,
	voices,
	totalAvailable,
	isLoading,
	isError,
	selectedVoiceIds,
	playingVoiceId,
	progress,
	onToggleVoice,
	onPlayVoice,
	onResetFilters,
}) => {
	const { t } = useTranslation('campaign.form.voices');

	if (isError) {
		return (
			<Alert
				variant='light'
				color='red'
				icon={<IconAlertCircle size={16} />}
				title={t('catalog.loadErrorTitle')}
			>
				{t('catalog.loadErrorDescription')}
			</Alert>
		);
	}

	if (isLoading) {
		return (
			<Center className={classes.loadingState}>
				<Loader size='sm' />
				<Text size='sm' c='dimmed' className={classes.loadingText}>
					{t('catalog.loading')}
				</Text>
			</Center>
		);
	}

	if (totalAvailable === 0) {
		return (
			<Paper withBorder radius='lg' p='md' className={classes.emptyState}>
				<IconMoodEmpty size={24} className={classes.emptyIcon} stroke={1.5} />
				<Text size='sm' c='dimmed'>
					{t('catalog.empty')}
				</Text>
			</Paper>
		);
	}

	if (voices.length === 0) {
		return (
			<Paper withBorder radius='lg' p='md' className={classes.emptyState}>
				<Text size='sm' c='dimmed'>
					{t('catalog.emptyFiltered')}
				</Text>
				<button
					type='button'
					className={classes.resetLink}
					onClick={onResetFilters}
				>
					{t('catalog.emptyFilteredReset')}
				</button>
			</Paper>
		);
	}

	return (
		<div id={id} className={classes.catalog}>
			<div className={classes.list}>
				{voices.map((voice) => (
					<VoiceCard
						key={voice.voice.id}
						voice={voice}
						selected={selectedVoiceIds.has(voice.voice.id)}
						playing={playingVoiceId === voice.voice.id}
						progress={progress}
						onToggle={onToggleVoice}
						onPlay={onPlayVoice}
					/>
				))}
			</div>
		</div>
	);
};

export default VoiceCatalog;
