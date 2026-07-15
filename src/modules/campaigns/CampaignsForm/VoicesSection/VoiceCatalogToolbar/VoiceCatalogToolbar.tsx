import { useMemo } from 'react';
import { ActionIcon, Chip, Group, Text, TextInput } from '@mantine/core';
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

const getToggledValue = (
	previous: string[],
	next: string[]
): string | undefined => {
	const previousSet = new Set(previous);
	const nextSet = new Set(next);

	return (
		next.find((value) => !previousSet.has(value)) ??
		previous.find((value) => !nextSet.has(value))
	);
};

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
			<Group justify='space-between' align='center' gap='sm' wrap='wrap'>
				<Group gap='xs' className={classes.searchGroup} wrap='nowrap'>
					<TextInput
						value={search}
						onChange={(event) => onSearchChange(event.currentTarget.value)}
						placeholder={t('toolbar.searchPlaceholder')}
						leftSection={<IconSearch size={14} />}
						rightSection={
							search ? (
								<ActionIcon
									variant='subtle'
									color='gray'
									size='sm'
									onClick={() => onSearchChange('')}
									aria-label={t('toolbar.reset')}
								>
									<IconX size={13} />
								</ActionIcon>
							) : undefined
						}
						size='sm'
						className={classes.search}
					/>
					<Text size='xs' c='dimmed' className={classes.count} component='span'>
						{t('catalog.resultsCount', { count: resultsCount })}
					</Text>
				</Group>

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
									const toggled = getToggledValue(selectedGenders, next);
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
									const toggled = getToggledValue(selectedLanguages, next);
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

					{hasActiveFilters && (
						<Text size='xs' c='dimmed'>
							{t('toolbar.activeFilters', { count: activeFilterCount })}
						</Text>
					)}
				</div>
			)}
		</div>
	);
};

export default VoiceCatalogToolbar;
