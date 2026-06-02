import { useCallback, useMemo } from 'react';
import { Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import { useGetAllAgentVoices } from '~/queries/agentVoiceQueries';
import { useCampaignFormContext } from '../../campaignFormFunctions';
import SelectedVoicesStrip from './SelectedVoicesStrip';
import VoiceCatalog from './VoiceCatalog';
import VoiceCatalogToolbar from './VoiceCatalogToolbar';
import { useVoiceFilters } from './useVoiceFilters';
import { useVoicePreview } from './useVoicePreview';
import classes from './VoicesSection.module.css';

const VoicesSection: React.FC = () => {
	const { t } = useTranslation('campaign.form.voices');
	const form = useCampaignFormContext();

	const { data: voices = [], isLoading, isError } = useGetAllAgentVoices();
	const filters = useVoiceFilters(voices);
	const preview = useVoicePreview();

	const selectedVoiceIds = useMemo(
		() => form.values.voiceIds ?? [],
		[form.values.voiceIds]
	);

	const selectedVoiceIdSet = useMemo(
		() => new Set(selectedVoiceIds),
		[selectedVoiceIds]
	);

	const selectedVoices = useMemo(() => {
		if (selectedVoiceIds.length === 0) {
			return [];
		}
		const byId = new Map(voices.map((entry) => [entry.voice.id, entry]));
		return selectedVoiceIds
			.map((id) => byId.get(id))
			.filter((entry): entry is (typeof voices)[number] => Boolean(entry));
	}, [selectedVoiceIds, voices]);

	const filteredVoices = useMemo(
		() => filters.filter(voices),
		[filters, voices]
	);

	const handleToggleVoice = useCallback(
		(voiceId: string) => {
			const current = form.values.voiceIds ?? [];
			const next = current.includes(voiceId)
				? current.filter((id) => id !== voiceId)
				: [...current, voiceId];
			form.setFieldValue('voiceIds', next);
		},
		[form]
	);

	const handleRemoveVoice = useCallback(
		(voiceId: string) => {
			const current = form.values.voiceIds ?? [];
			form.setFieldValue(
				'voiceIds',
				current.filter((id) => id !== voiceId)
			);
			if (preview.playingVoiceId === voiceId) {
				preview.stop();
			}
		},
		[form, preview]
	);

	const handleClearAll = useCallback(() => {
		form.setFieldValue('voiceIds', []);
		preview.stop();
	}, [form, preview]);

	return (
		<SectionCard
			title={t('section.title')}
			description={t('section.description')}
		>
			<Stack gap='md'>
				<SelectedVoicesStrip
					selectedVoices={selectedVoices}
					totalSelectedCount={selectedVoiceIds.length}
					resolvingMissing={
						isLoading && selectedVoiceIds.length > selectedVoices.length
					}
					playingVoiceId={preview.playingVoiceId}
					onPlay={preview.toggle}
					onRemove={handleRemoveVoice}
					onClearAll={handleClearAll}
				/>

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
					onReset={filters.reset}
					resultsCount={filteredVoices.length}
				/>

				<VoiceCatalog
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
