import { useCallback, useMemo } from 'react';
import { Alert, Badge, Text, Title } from '@mantine/core';
import {
	IconAlertTriangle,
	IconMicrophone,
	IconPlaylist,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import { useGetAllAgentVoices } from '~/queries/agentVoiceQueries';
import { useCampaignFormContext } from '../../campaignFormFunctions';
import VoiceAssignmentsList from './VoiceAssignmentsList';
import VoiceCatalog from './VoiceCatalog';
import VoiceCatalogToolbar from './VoiceCatalogToolbar';
import { useVoiceFilters } from './useVoiceFilters';
import { useVoicePreview } from './useVoicePreview';
import {
	getCampaignVoiceAssignmentIssues,
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

	const handleAddVoice = useCallback(() => {
		const catalogElement = document.getElementById(CATALOG_ID);
		catalogElement?.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		});
	}, []);

	const selectedCount = selectedVoiceIds.length;

	return (
		<div className={classes.layout}>
			<div className={classes.pageHeader}>
				<div>
					<Title order={4} className={classes.pageTitle}>
						{t('section.title')}
					</Title>
					<Text className={classes.pageDescription}>
						{t('section.description')}
					</Text>
				</div>
			</div>

			<div className={classes.workspace}>
				<SectionCard
					title={t('catalog.title')}
					icon={IconMicrophone}
					contentSpacing='sm'
				>
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
				</SectionCard>

				<SectionCard
					title={t('selected.title')}
					icon={IconPlaylist}
					contentSpacing='sm'
					className={classes.selectionPanel}
					headerExtras={
						<Badge variant='light' color='gray'>
							{selectedCount}
						</Badge>
					}
				>
					<VoiceAssignmentsList
						voices={voices}
						playingVoiceId={preview.playingVoiceId}
						onPlay={preview.toggle}
						onRemove={handleRemoveVoice}
						onAddVoice={handleAddVoice}
						onClearAll={handleClearAll}
					/>

					{assignmentIssues.length > 0 && (
						<Alert
							variant='light'
							color='yellow'
							icon={<IconAlertTriangle size={16} />}
							title={t('summary.issueTitle')}
						>
							<Text size='sm'>
								{t('summary.issueText', {
									count: assignmentIssues.length,
								})}
							</Text>
						</Alert>
					)}
				</SectionCard>
			</div>
		</div>
	);
};

export default VoicesSection;
