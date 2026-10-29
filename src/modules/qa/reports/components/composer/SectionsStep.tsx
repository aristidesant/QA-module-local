import React, { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Center,
	Checkbox,
	Group,
	SegmentedControl,
	Select,
	Stack,
	Text,
	ThemeIcon,
	Tooltip,
	VisuallyHidden,
} from '@mantine/core';
import {
	IconChevronDown,
	IconChevronRight,
	IconChevronUp,
} from '@tabler/icons-react';
import type {
	ReportDraft,
	ReportGroupBy,
	ReportSectionKey,
	ReportSectionView,
	SubsectionedSectionKey,
} from '~/models/qa/reportBuilder';
import {
	CLIENT_SECTIONS,
	SECTION_ICON,
	SECTION_ORDER,
	SECTION_VIEW_ICON,
	SUBSECTIONS,
	VIEWS_OF_SECTION,
	isChartableSection,
	isSubsectionedSection,
} from '../../constants';
import {
	effectiveSectionView,
	selectedSubsections,
	subsectionViewOf,
} from '../../helpers';
import styles from '../../Reports.module.css';

const GROUP_BY: ReportGroupBy[] = [
	'none',
	'team',
	'supervisor',
	'agent',
	'campaign',
	'lineOfBusiness',
];

interface SectionsStepProps {
	draft: ReportDraft;
	onChange: (patch: Partial<ReportDraft>) => void;
	sectionsError?: string;
}

interface ViewControlProps {
	value: ReportSectionView | 'mixed';
	views: ReportSectionView[];
	onChange: (view: ReportSectionView) => void;
	ariaLabel: string;
	/** Text labels read faster on the section row; the subsection rows keep icons. */
	labels?: boolean;
}

/** Values / bar / line switch. A 'mixed' value adds a disabled option so the control still reads. */
const ViewControl: React.FC<ViewControlProps> = ({
	value,
	views,
	onChange,
	ariaLabel,
	labels = false,
}) => {
	const { t } = useTranslation('qa.reports');
	const data = views.map((view) => {
		const ViewIcon = SECTION_VIEW_ICON[view];
		return {
			value: view,
			label: labels ? (
				t(`sections.views.${view}`)
			) : (
				<Tooltip label={t(`sections.views.${view}`)} withArrow>
					<Center>
						<ViewIcon size={14} />
						<VisuallyHidden>{t(`sections.views.${view}`)}</VisuallyHidden>
					</Center>
				</Tooltip>
			),
		};
	});
	return (
		<SegmentedControl
			size='sm'
			value={value}
			onChange={(view) => {
				if (view !== 'mixed') onChange(view as ReportSectionView);
			}}
			aria-label={ariaLabel}
			data={
				value === 'mixed'
					? [
							{
								value: 'mixed',
								label: t('sections.views.mixed'),
								disabled: true,
							},
							...data,
						]
					: data
			}
		/>
	);
};

/** Which blocks the document contains, in which order, and how each section and subsection is shown. */
export const SectionsStep: React.FC<SectionsStepProps> = ({
	draft,
	onChange,
	sectionsError,
}) => {
	const { t } = useTranslation('qa.reports');
	const [expanded, setExpanded] = useState<Set<ReportSectionKey>>(
		() => new Set()
	);

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

	const toggleExpanded = (section: ReportSectionKey) =>
		setExpanded((current) => {
			const next = new Set(current);
			if (next.has(section)) next.delete(section);
			else next.add(section);
			return next;
		});

	/** The section's view applies to every subsection: their own choices are dropped. */
	const setSectionView = (
		section: ReportSectionKey,
		view: ReportSectionView
	) => {
		if (!isChartableSection(section)) return;
		const subsectionViews = Object.fromEntries(
			Object.entries(draft.subsectionViews ?? {}).filter(
				([key]) => !key.startsWith(`${section}.`)
			)
		);
		onChange({
			sectionViews: { ...draft.sectionViews, [section]: view },
			subsectionViews,
		});
	};

	const setSubsectionView = (
		section: SubsectionedSectionKey,
		sub: string,
		view: ReportSectionView
	) =>
		onChange({
			subsectionViews: {
				...draft.subsectionViews,
				[`${section}.${sub}`]: view,
			},
		});

	/** Writes the selection in catalogue order. */
	const toggleSubsection = (
		section: SubsectionedSectionKey,
		sub: string,
		checked: boolean
	) => {
		const current = selectedSubsections(draft, section).map((s) => s.key);
		const next = SUBSECTIONS[section]
			.map((s) => s.key)
			.filter((key) => (key === sub ? checked : current.includes(key)));
		onChange({ subsections: { ...draft.subsections, [section]: next } });
	};

	/** "3 of 6 subsections · Bars", the line a collapsed section shows instead of its description. */
	const summaryOf = (section: SubsectionedSectionKey) => {
		const count = selectedSubsections(draft, section).length;
		const view = effectiveSectionView(draft, section);
		return `${t('sections.subsectionSummary', {
			count,
			total: SUBSECTIONS[section].length,
		})} · ${t(`sections.views.${view}`)}`;
	};

	return (
		<Stack gap='md'>
			<Select
				label={t('scope.groupBy')}
				size='sm'
				w={240}
				data={GROUP_BY.map((value) => ({
					value,
					label: t(`scope.groupByOptions.${value}`),
				}))}
				value={draft.groupBy}
				onChange={(value) =>
					value && onChange({ groupBy: value as ReportGroupBy })
				}
				allowDeselect={false}
			/>

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
						const sectionLabel = t(`sections.items.${section}.label`);
						const hasSubsections = isSubsectionedSection(section);
						const open = hasSubsections && expanded.has(section);

						const row = (
							<div
								className={styles.sectionRow}
								data-disabled={blocked || undefined}
							>
								<Checkbox
									checked={selected}
									disabled={blocked}
									onChange={(event) =>
										toggle(section, event.currentTarget.checked)
									}
									aria-label={sectionLabel}
								/>
								<ThemeIcon variant='light' size='sm' color='gray'>
									<Icon size={14} />
								</ThemeIcon>
								<div className={styles.sectionLabel}>
									<Text size='sm' fw={500}>
										{sectionLabel}
									</Text>
									<Text size='xs' c='dimmed' lineClamp={1}>
										{selected && hasSubsections
											? summaryOf(section)
											: t(`sections.items.${section}.description`)}
									</Text>
								</div>
								{selected && isChartableSection(section) && (
									<ViewControl
										labels
										value={effectiveSectionView(draft, section)}
										views={VIEWS_OF_SECTION[section]}
										onChange={(view) => setSectionView(section, view)}
										ariaLabel={t('sections.viewLabel', {
											section: sectionLabel,
										})}
									/>
								)}
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
										{hasSubsections && !blocked && (
											<ActionIcon
												variant='subtle'
												color='gray'
												size='sm'
												aria-expanded={open}
												aria-label={t(
													open
														? 'sections.hideSubsections'
														: 'sections.showSubsections'
												)}
												onClick={() => toggleExpanded(section)}
											>
												{open ? (
													<IconChevronDown size={14} />
												) : (
													<IconChevronRight size={14} />
												)}
											</ActionIcon>
										)}
									</Group>
								)}
							</div>
						);

						const subsections =
							selected && open && isSubsectionedSection(section)
								? (() => {
										const chosen = selectedSubsections(draft, section).map(
											(sub) => sub.key
										);
										return (
											<Stack gap={2} ml='xl'>
												{SUBSECTIONS[section].map((sub) => {
													const checked = chosen.includes(sub.key);
													const last = checked && chosen.length === 1;
													const subLabel = t(
														`sections.subsections.${section}.${sub.key}`
													);
													const checkbox = (
														<Checkbox
															checked={checked}
															disabled={last}
															onChange={(event) =>
																toggleSubsection(
																	section,
																	sub.key,
																	event.currentTarget.checked
																)
															}
															aria-label={subLabel}
														/>
													);
													return (
														<div key={sub.key} className={styles.sectionRow}>
															{last ? (
																<Tooltip
																	label={t('sections.keepOne')}
																	withArrow
																>
																	<span>{checkbox}</span>
																</Tooltip>
															) : (
																checkbox
															)}
															<div className={styles.sectionLabel}>
																<Text size='sm'>{subLabel}</Text>
															</div>
															{checked && (
																<ViewControl
																	value={subsectionViewOf(
																		draft,
																		section,
																		sub.key
																	)}
																	views={VIEWS_OF_SECTION[section]}
																	onChange={(view) =>
																		setSubsectionView(section, sub.key, view)
																	}
																	ariaLabel={t('sections.subsectionViewLabel', {
																		subsection: subLabel,
																	})}
																/>
															)}
														</div>
													);
												})}
											</Stack>
										);
									})()
								: null;

						return (
							<Fragment key={section}>
								{blocked ? (
									<Tooltip label={t('sections.internalOnly')} withArrow>
										{row}
									</Tooltip>
								) : (
									row
								)}
								{subsections}
							</Fragment>
						);
					})}
				</Stack>
			</div>

			<Text size='xs' c='dimmed'>
				{t('sections.viewHint')}
			</Text>
		</Stack>
	);
};

export default SectionsStep;
