import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Checkbox,
	Group,
	MultiSelect,
	Stack,
	Text,
	ThemeIcon,
	Tooltip,
} from '@mantine/core';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import type { ReportDraft, ReportSectionKey } from '~/models/qa/reportBuilder';
import {
	ALL_REPORT_METRICS,
	CLIENT_SECTIONS,
	SECTION_ICON,
	SECTION_ORDER,
} from '../../constants';
import styles from '../../Reports.module.css';

interface SectionsStepProps {
	draft: ReportDraft;
	onChange: (patch: Partial<ReportDraft>) => void;
	sectionsError?: string;
}

/** Which blocks the document contains, in which order, with which columns. */
export const SectionsStep: React.FC<SectionsStepProps> = ({
	draft,
	onChange,
	sectionsError,
}) => {
	const { t } = useTranslation('qa.reports');
	const { t: tMetrics } = useTranslation('qa.teamAnalytics');

	const isClient = draft.audience === 'client';

	/** Selected sections first (in their own order), then the rest. */
	const rows = useMemo(() => {
		const rest = SECTION_ORDER.filter(
			(section) => !draft.sections.includes(section)
		);
		return [...draft.sections, ...rest];
	}, [draft.sections]);

	const toggle = (section: ReportSectionKey, checked: boolean) => {
		onChange({
			sections: checked
				? [...draft.sections, section]
				: draft.sections.filter((key) => key !== section),
		});
	};

	const move = (section: ReportSectionKey, delta: number) => {
		const index = draft.sections.indexOf(section);
		const target = index + delta;
		if (index < 0 || target < 0 || target >= draft.sections.length) return;
		const next = [...draft.sections];
		[next[index], next[target]] = [next[target], next[index]];
		onChange({ sections: next });
	};

	const metricOptions = useMemo(
		() =>
			ALL_REPORT_METRICS.map((metricId) => ({
				value: metricId,
				label: tMetrics(`metrics.${metricId}`, { defaultValue: metricId }),
			})),
		[tMetrics]
	);

	return (
		<Stack gap='md'>
			<div>
				<Group justify='space-between' mb={4}>
					<Text size='sm' fw={500}>
						{t('sections.label')}
					</Text>
					<Text size='xs' c={sectionsError ? 'red' : 'dimmed'}>
						{sectionsError ??
							t('sections.selected', { count: draft.sections.length })}
					</Text>
				</Group>

				<Stack gap={2}>
					{rows.map((section) => {
						const selected = draft.sections.includes(section);
						const position = draft.sections.indexOf(section);
						const blocked = isClient && !CLIENT_SECTIONS.includes(section);
						const Icon = SECTION_ICON[section];

						const row = (
							<div
								key={section}
								className={styles.sectionRow}
								data-disabled={blocked || undefined}
							>
								<Checkbox
									checked={selected}
									disabled={blocked}
									onChange={(event) =>
										toggle(section, event.currentTarget.checked)
									}
									aria-label={t(`sections.items.${section}.label`)}
								/>
								<ThemeIcon variant='light' size='sm' color='gray'>
									<Icon size={14} />
								</ThemeIcon>
								<div className={styles.sectionLabel}>
									<Text size='sm' fw={500}>
										{t(`sections.items.${section}.label`)}
									</Text>
									<Text size='xs' c='dimmed' lineClamp={1}>
										{t(`sections.items.${section}.description`)}
									</Text>
								</div>
								{selected && (
									<Group gap={2} wrap='nowrap'>
										<ActionIcon
											variant='subtle'
											color='gray'
											size='sm'
											disabled={position === 0}
											aria-label={t('sections.moveUp')}
											onClick={() => move(section, -1)}
										>
											<IconChevronUp size={14} />
										</ActionIcon>
										<ActionIcon
											variant='subtle'
											color='gray'
											size='sm'
											disabled={position === draft.sections.length - 1}
											aria-label={t('sections.moveDown')}
											onClick={() => move(section, 1)}
										>
											<IconChevronDown size={14} />
										</ActionIcon>
									</Group>
								)}
							</div>
						);

						return blocked ? (
							<Tooltip
								key={section}
								label={t('sections.internalOnly')}
								withArrow
							>
								{row}
							</Tooltip>
						) : (
							row
						);
					})}
				</Stack>
			</div>

			<MultiSelect
				label={t('sections.metrics')}
				description={t('sections.metricsHint')}
				data={metricOptions}
				value={draft.metrics}
				onChange={(metrics) =>
					onChange({ metrics: metrics as ReportDraft['metrics'] })
				}
				clearable
				searchable
			/>
		</Stack>
	);
};

export default SectionsStep;
