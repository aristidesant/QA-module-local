import { useMemo } from 'react';
import { Badge, Chip, Group, Stack, Text, TextInput } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { getLanguageFlagEmoji } from '~/utils/agentUtils';
import type { VoiceFilterOption } from '../useVoiceFilters';
import classes from './VoiceCatalogToolbar.module.css';

export interface VoiceCatalogToolbarProps {
	search: string;
	onSearchChange: (value: string) => void;
	genderOptions: VoiceFilterOption[];
	selectedGenders: string[];
	onToggleGender: (value: string) => void;
	languageOptions: VoiceFilterOption[];
	selectedLanguages: string[];
	onToggleLanguage: (value: string) => void;
	hasActiveFilters: boolean;
	activeFilterCount: number;
	onReset: () => void;
	resultsCount: number;
}

const VoiceCatalogToolbar: React.FC<VoiceCatalogToolbarProps> = ({
	search,
	onSearchChange,
	genderOptions,
	selectedGenders,
	onToggleGender,
	languageOptions,
	selectedLanguages,
	onToggleLanguage,
	hasActiveFilters,
	activeFilterCount,
	onReset,
	resultsCount,
}) => {
	const { t } = useTranslation('campaign.form.voices');

	const genderLabelFor = useMemo(
		() =>
			(option: VoiceFilterOption): string => {
				const key = option.value;
				if (key === 'female' || key === 'male') {
					return t(`gender.${key}`);
				}
				return option.label || t('gender.other');
			},
		[t]
	);

	const showFilters = genderOptions.length > 0 || languageOptions.length > 0;

	return (
		<div className={classes.toolbar}>
			<Group justify='space-between' align='flex-end' gap='sm' wrap='wrap'>
				<Stack gap={4} className={classes.searchGroup}>
					<TextInput
						value={search}
						onChange={(event) => onSearchChange(event.currentTarget.value)}
						placeholder={t('toolbar.searchPlaceholder')}
						leftSection={<IconSearch size={14} />}
						rightSection={
							search ? (
								<IconX
									size={14}
									className={classes.clearSearchIcon}
									onClick={() => onSearchChange('')}
									aria-label={t('toolbar.reset')}
									role='button'
								/>
							) : undefined
						}
						size='sm'
						className={classes.search}
					/>
					<Text size='xs' c='dimmed' className={classes.count}>
						{t('catalog.resultsCount', { count: resultsCount })}
					</Text>
				</Stack>

				{hasActiveFilters && (
					<button
						type='button'
						onClick={onReset}
						className={classes.resetButton}
					>
						{t('toolbar.reset')}
					</button>
				)}
			</Group>

			{showFilters && (
				<div className={classes.filters}>
					{genderOptions.length > 0 && (
						<div className={classes.filterRow}>
							<Text size='xs' fw={600} className={classes.filterLabel}>
								{t('toolbar.gender')}
							</Text>
							<Chip.Group
								multiple
								value={selectedGenders}
								onChange={(values) => {
									const next = Array.isArray(values) ? values : [values];
									const previous = selectedGenders;
									const added = next.find((v) => !previous.includes(v));
									const removed = previous.find((v) => !next.includes(v));
									const toggled = added ?? removed;
									if (toggled) {
										onToggleGender(toggled);
									}
								}}
							>
								<Group gap={6} wrap='wrap'>
									{genderOptions.map((option) => (
										<Chip
											key={option.value}
											value={option.value}
											size='xs'
											variant='outline'
											className={classes.chip}
										>
											{genderLabelFor(option)}
										</Chip>
									))}
								</Group>
							</Chip.Group>
						</div>
					)}

					{languageOptions.length > 0 && (
						<div className={classes.filterRow}>
							<Text size='xs' fw={600} className={classes.filterLabel}>
								{t('toolbar.language')}
							</Text>
							<Chip.Group
								multiple
								value={selectedLanguages}
								onChange={(values) => {
									const next = Array.isArray(values) ? values : [values];
									const previous = selectedLanguages;
									const added = next.find((v) => !previous.includes(v));
									const removed = previous.find((v) => !next.includes(v));
									const toggled = added ?? removed;
									if (toggled) {
										onToggleLanguage(toggled);
									}
								}}
							>
								<Group gap={6} wrap='wrap'>
									{languageOptions.map((option) => (
										<Chip
											key={option.value}
											value={option.value}
											size='xs'
											variant='outline'
											className={classes.chip}
										>
											<span className={classes.chipContent}>
												<span aria-hidden='true'>
													{getLanguageFlagEmoji(option.label)}
												</span>
												{option.label}
											</span>
										</Chip>
									))}
								</Group>
							</Chip.Group>
						</div>
					)}

					<Text size='xs' c='dimmed' className={classes.helper}>
						{hasActiveFilters
							? t('toolbar.activeFilters', { count: activeFilterCount })
							: t('toolbar.noFilters')}
					</Text>
				</div>
			)}

			{hasActiveFilters && (
				<Badge
					variant='light'
					color='gray'
					radius='xl'
					className={classes.filterBadge}
				>
					{t('toolbar.activeFiltersLabel', { count: activeFilterCount })}
				</Badge>
			)}
		</div>
	);
};

export default VoiceCatalogToolbar;
