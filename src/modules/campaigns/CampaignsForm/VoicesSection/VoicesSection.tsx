import { useCallback, useMemo } from 'react';
import { Alert, Paper, Stack, Text } from '@mantine/core';
import { IconInfoCircle, IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import { useGetAllAgentVoices } from '~/queries/agentVoiceQueries';
import { useCampaignFormContext } from '../../campaignFormFunctions';
import SelectedVoicesStrip from './SelectedVoicesStrip';
import VoiceAssignmentsList from './VoiceAssignmentsList';
import VoiceCatalog from './VoiceCatalog';
import VoiceCatalogToolbar from './VoiceCatalogToolbar';
import { useVoiceFilters } from './useVoiceFilters';
import { useVoicePreview } from './useVoicePreview';
import {
	getCampaignVoiceAssignmentIssues,
	getCampaignVoiceAssignmentStats,
	normalizeCampaignVoiceAssignments,
} from '~/modules/campaigns/utils/campaignVoiceAssignments';
import classes from './VoicesSection.module.css';

const CATALOG_ID = 'voice-catalog';

const VoicesSection: React.FC = () => {
	const { t } = useTranslation('campaign.form.voices');
	const form = useCampaignFormContext();

	const { data: voices = [], isLoading, isError } = useGetAllAgentVoices();
	const filters = useVoiceFilters(voices);
	const preview = useVoicePreview();

	const selectedVoiceAssignments = useMemo(
		() => normalizeCampaignVoiceAssignments(form.values.voices),
		[form.values.voices]
	);

	const selectedVoiceIds = useMemo(
		() => selectedVoiceAssignments.map((voice) => voice.voiceId),
		[selectedVoiceAssignments]
	);

	const selectedVoiceIdSet = useMemo(
		() => new Set(selectedVoiceIds),
		[selectedVoiceIds]
	);

	const filteredVoices = useMemo(
		() => filters.filter(voices),
		[filters, voices]
	);

	const assignmentStats = useMemo(
		() => getCampaignVoiceAssignmentStats(selectedVoiceAssignments, voices),
		[selectedVoiceAssignments, voices]
	);
	const assignmentIssues = useMemo(
		() => getCampaignVoiceAssignmentIssues(selectedVoiceAssignments, voices),
		[selectedVoiceAssignments, voices]
	);

	const handleToggleVoice = useCallback(
		(voiceId: string) => {
			const current = form.values.voices ?? [];
			const next = current.some((voice) => voice.voiceId === voiceId)
				? current.filter((voice) => voice.voiceId !== voiceId)
				: [...current, { voiceId, voiceName: '' }];
			form.setFieldValue('voices', next);
			form.setFieldValue(
				'voiceIds',
				next.map((voice) => voice.voiceId)
			);
		},
		[form]
	);

	const handleRemoveVoice = useCallback(
		(voiceId: string) => {
			const next = (form.values.voices ?? []).filter(
				(voice) => voice.voiceId !== voiceId
			);
			form.setFieldValue('voices', next);
			form.setFieldValue(
				'voiceIds',
				next.map((voice) => voice.voiceId)
			);
			if (preview.playingVoiceId === voiceId) {
				preview.stop();
			}
		},
		[form, preview]
	);

	const handleClearAll = useCallback(() => {
		form.setFieldValue('voices', []);
		form.setFieldValue('voiceIds', []);
		preview.stop();
	}, [form, preview]);

	const handleManageDefaults = useCallback(() => {
		const current = form.values.voices ?? [];
		if (current.length === 0) {
			return;
		}

		const next = current.map((voice) => ({
			...voice,
			voiceName: '',
		}));

		form.setFieldValue('voices', next);
		form.setFieldValue(
			'voiceIds',
			next.map((voice) => voice.voiceId)
		);
	}, [form]);

	const handleAddVoice = useCallback(() => {
		const catalogElement = document.getElementById(CATALOG_ID);
		catalogElement?.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		});
	}, []);

	const selectedCount = selectedVoiceIds.length;
	const summaryStatusColor: 'gray' | 'green' | 'yellow' | 'red' =
		selectedCount === 0
			? 'gray'
			: assignmentIssues.length > 0
				? 'yellow'
				: 'green';
	const summaryStatusLabel =
		selectedCount === 0
			? t('summary.statusEmpty')
			: assignmentIssues.length > 0
				? t('summary.statusReview')
				: t('summary.statusGood');
	const helperTone = assignmentIssues.length > 0 ? 'yellow' : 'blue';

	return (
		<SectionCard
			title={t('section.title')}
			description={t('section.description')}
		>
			<Stack gap='md' className={classes.layout}>
				<SelectedVoicesStrip
					selectedCount={selectedCount}
					availableCount={voices.length}
					customNameCount={assignmentStats.customNameCount}
					statusLabel={summaryStatusLabel}
					statusColor={summaryStatusColor}
					onManageDefaults={handleManageDefaults}
				/>

				<VoiceAssignmentsList
					voices={voices}
					playingVoiceId={preview.playingVoiceId}
					onPlay={preview.toggle}
					onRemove={handleRemoveVoice}
					onAddVoice={handleAddVoice}
					onClearAll={handleClearAll}
				/>

				<Paper
					withBorder
					radius='lg'
					p='sm'
					className={classes.note}
					data-tone={helperTone}
				>
					<Alert
						variant='light'
						color={helperTone}
						icon={
							helperTone === 'yellow' ? (
								<IconAlertTriangle size={16} />
							) : (
								<IconInfoCircle size={16} />
							)
						}
						title={
							helperTone === 'yellow'
								? t('summary.issueTitle')
								: t('summary.infoTitle')
						}
						className={classes.alert}
					>
						<Text size='sm' className={classes.noteText}>
							{helperTone === 'yellow'
								? t('summary.issueText', {
										count: assignmentIssues.length,
									})
								: t('summary.infoText')}
						</Text>
					</Alert>
				</Paper>

				<VoiceCatalogToolbar
					search={filters.search}
					onSearchChange={filters.setSearch}
					genderOptions={filters.availableGenders}
					selectedGenders={filters.genders}
					onToggleGender={filters.toggleGender}
					languageOptions={filters.availableLanguages}
					selectedLanguages={filters.languages}
					onToggleLanguage={filters.toggleLanguage}
					hasActiveFilters={filters.hasActiveFilters}
					activeFilterCount={filters.activeFilterCount}
					onReset={filters.reset}
					resultsCount={filteredVoices.length}
				/>

				<VoiceCatalog
					id={CATALOG_ID}
					voices={filteredVoices}
					totalAvailable={voices.length}
					isLoading={isLoading}
					isError={isError}
					selectedVoiceIds={selectedVoiceIdSet}
					playingVoiceId={preview.playingVoiceId}
					progress={preview.progress}
					onToggleVoice={handleToggleVoice}
					onPlayVoice={preview.toggle}
					onResetFilters={filters.reset}
				/>

				<audio
					ref={preview.audioRef}
					onEnded={preview.handleEnded}
					onTimeUpdate={preview.handleTimeUpdate}
					className={classes.hiddenAudio}
				/>
			</Stack>
		</SectionCard>
	);
};

export default VoicesSection;
