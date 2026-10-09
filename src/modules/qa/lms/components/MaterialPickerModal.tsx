import { useEffect, useMemo, useState } from 'react';
import {
	Button,
	Checkbox,
	Chip,
	Group,
	Input,
	Modal,
	Radio,
	Select,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import EmptyState from '~/components/EmptyState';
import type {
	LmsArea,
	LmsContent,
	LmsFormat,
	LmsLearningPath,
	LmsLevel,
} from '~/models/qa';
import { selectContent, selectPaths, useLmsStore } from '~/stores/qa/lmsStore';
import { LMS_AREAS, LMS_FORMATS, LMS_LEVELS } from '../constants';
import { AreaBadge, FormatBadge } from './Badges';
import styles from './MaterialPickerModal.module.css';

type GroupBy = 'FORMAT' | 'SUBJECT' | 'AREA' | 'NONE';

interface Filters {
	search: string;
	formats: LmsFormat[];
	areas: LmsArea[];
	subItem: string | null;
	levels: LmsLevel[];
	tags: string[];
}

const EMPTY_FILTERS: Filters = {
	search: '',
	formats: [],
	areas: [],
	subItem: null,
	levels: [],
	tags: [],
};

/** How many tags the rail offers; the data has a long tail of one-off tags. */
const MAX_TAG_CHIPS = 10;

/** Whether a facet is narrowing the list (the search box is not a facet). */
const hasFilters = (f: Filters) =>
	f.search.trim() !== '' ||
	f.formats.length > 0 ||
	f.areas.length > 0 ||
	f.subItem !== null ||
	f.levels.length > 0 ||
	f.tags.length > 0;

/** `skip` leaves one facet out, so its own counts show what each option would add. */
const matchesContent = (
	c: LmsContent,
	f: Filters,
	skip?: keyof Filters
): boolean => {
	const q = f.search.trim().toLowerCase();
	if (
		q &&
		!(
			c.title.toLowerCase().includes(q) ||
			c.summary.toLowerCase().includes(q) ||
			c.tags.some((tag) => tag.toLowerCase().includes(q))
		)
	) {
		return false;
	}
	if (skip !== 'formats' && f.formats.length && !f.formats.includes(c.format))
		return false;
	if (skip !== 'areas' && f.areas.length && !f.areas.includes(c.area))
		return false;
	if (skip !== 'subItem' && f.subItem && c.subItem !== f.subItem) return false;
	if (skip !== 'levels' && f.levels.length && !f.levels.includes(c.level))
		return false;
	if (
		skip !== 'tags' &&
		f.tags.length &&
		!f.tags.some((x) => c.tags.includes(x))
	)
		return false;
	return true;
};

const matchesPath = (
	p: LmsLearningPath,
	f: Filters,
	skip?: keyof Filters
): boolean => {
	const q = f.search.trim().toLowerCase();
	if (
		q &&
		!(
			p.title.toLowerCase().includes(q) ||
			p.description.toLowerCase().includes(q)
		)
	) {
		return false;
	}
	if (skip !== 'areas' && f.areas.length && !f.areas.includes(p.area))
		return false;
	if (skip !== 'levels' && f.levels.length && !f.levels.includes(p.level))
		return false;
	return true;
};

interface FacetOption<T extends string> {
	value: T;
	label: string;
	count: number;
}

/** A labelled checklist of one facet, each option showing how many items it holds. */
function Facet<T extends string>({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: FacetOption<T>[];
	value: T[];
	onChange: (next: T[]) => void;
}) {
	return (
		<Checkbox.Group
			label={label}
			value={value}
			onChange={(next) => onChange(next as T[])}
		>
			<Stack gap={6} mt={6}>
				{options.map((option) => (
					<Checkbox
						key={option.value}
						size='xs'
						value={option.value}
						disabled={option.count === 0 && !value.includes(option.value)}
						label={
							<Group gap={6} wrap='nowrap'>
								<span>{option.label}</span>
								<Text span size='xs' c='dimmed'>
									{option.count}
								</Text>
							</Group>
						}
					/>
				))}
			</Stack>
		</Checkbox.Group>
	);
}

interface MaterialPickerModalProps {
	opened: boolean;
	onClose: () => void;
	/** `content` picks several materials; `path` picks one learning path. */
	mode: 'content' | 'path';
	/** Content ids, or a single path id, already chosen; the modal starts with them checked. */
	selectedIds: string[];
	/** Aspect the filter starts on, so a rule only offers material for what it measures. */
	initialArea?: LmsArea | null;
	onConfirm: (ids: string[]) => void;
}

/**
 * Browse the Learning & Development library and pick what a rule assigns.
 * Material can be narrowed by type, aspect, subject, level and tag and grouped
 * by any of them; learning paths by aspect and level. Only published items show.
 */
export function MaterialPickerModal({
	opened,
	onClose,
	mode,
	selectedIds,
	initialArea = null,
	onConfirm,
}: MaterialPickerModalProps) {
	const { t } = useTranslation('qa.lms');
	const isNarrow = useMediaQuery('(max-width: 48em)');
	const content = useLmsStore(selectContent);
	const paths = useLmsStore(selectPaths);
	const isPath = mode === 'path';

	const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
	const [groupBy, setGroupBy] = useState<GroupBy>('FORMAT');
	const [draft, setDraft] = useState<string[]>(selectedIds);

	// Every time the modal opens it starts from the rule's aspect and what is already chosen.
	useEffect(() => {
		if (!opened) return;
		setFilters({ ...EMPTY_FILTERS, areas: initialArea ? [initialArea] : [] });
		setGroupBy('FORMAT');
		setDraft(selectedIds);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [opened]);

	const patch = (next: Partial<Filters>) =>
		setFilters((prev) => ({ ...prev, ...next }));

	const pool = useMemo(
		() => content.filter((c) => c.status === 'PUBLISHED'),
		[content]
	);
	const pathPool = useMemo(
		() => paths.filter((p) => p.status === 'PUBLISHED'),
		[paths]
	);

	const items = useMemo(
		() => pool.filter((c) => matchesContent(c, filters)),
		[pool, filters]
	);
	const matchingPaths = useMemo(
		() => pathPool.filter((p) => matchesPath(p, filters)),
		[pathPool, filters]
	);

	const subjectLabel = (key: string | null) =>
		key ? t(`subItems.${key}`) : t('picker.noSubject');

	// Counts per option reflect every other active filter, so they say what ticking it would show.
	const formatOptions: FacetOption<LmsFormat>[] = LMS_FORMATS.map((value) => ({
		value,
		label: t(`formats.${value}`),
		count: pool.filter(
			(c) => c.format === value && matchesContent(c, filters, 'formats')
		).length,
	}));
	const areaOptions: FacetOption<LmsArea>[] = LMS_AREAS.map((value) => ({
		value,
		label: t(`areas.${value}`),
		count: isPath
			? pathPool.filter(
					(p) => p.area === value && matchesPath(p, filters, 'areas')
				).length
			: pool.filter(
					(c) => c.area === value && matchesContent(c, filters, 'areas')
				).length,
	}));
	const levelOptions: FacetOption<LmsLevel>[] = LMS_LEVELS.map((value) => ({
		value,
		label: t(`levels.${value}`),
		count: isPath
			? pathPool.filter(
					(p) => p.level === value && matchesPath(p, filters, 'levels')
				).length
			: pool.filter(
					(c) => c.level === value && matchesContent(c, filters, 'levels')
				).length,
	}));

	const subjectOptions = useMemo(() => {
		const keys = new Set<string>();
		for (const c of pool) {
			if (c.subItem && matchesContent(c, filters, 'subItem'))
				keys.add(c.subItem);
		}
		return [...keys]
			.map((value) => ({ value, label: t(`subItems.${value}`) }))
			.sort((a, b) => a.label.localeCompare(b.label));
	}, [pool, filters, t]);

	const tagOptions = useMemo(() => {
		const counts = new Map<string, number>();
		for (const c of pool) {
			for (const tag of c.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
		}
		return [...counts.entries()]
			.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
			.slice(0, MAX_TAG_CHIPS)
			.map(([tag]) => tag);
	}, [pool]);

	const groups = useMemo(() => {
		const keyOf = (c: LmsContent): string =>
			groupBy === 'FORMAT'
				? c.format
				: groupBy === 'AREA'
					? c.area
					: groupBy === 'SUBJECT'
						? (c.subItem ?? '')
						: 'all';
		const labelOf = (key: string): string =>
			groupBy === 'FORMAT'
				? t(`formats.${key}`)
				: groupBy === 'AREA'
					? t(`areas.${key}`)
					: groupBy === 'SUBJECT'
						? subjectLabel(key || null)
						: '';
		const map = new Map<string, LmsContent[]>();
		for (const c of items) {
			const key = keyOf(c);
			map.set(key, [...(map.get(key) ?? []), c]);
		}
		const order = (key: string) =>
			groupBy === 'FORMAT'
				? LMS_FORMATS.indexOf(key as LmsFormat)
				: groupBy === 'AREA'
					? LMS_AREAS.indexOf(key as LmsArea)
					: 0;
		return [...map.entries()]
			.map(([key, list]) => ({ key, label: labelOf(key), items: list }))
			.sort((a, b) =>
				groupBy === 'SUBJECT'
					? // Items without a subject go last.
						a.key === '' || b.key === ''
						? Number(a.key === '') - Number(b.key === '')
						: a.label.localeCompare(b.label)
					: order(a.key) - order(b.key)
			);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [items, groupBy, t]);

	const toggle = (id: string) =>
		setDraft((prev) =>
			prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
		);

	const confirm = () => {
		onConfirm(draft);
		onClose();
	};

	const resultCount = isPath ? matchingPaths.length : items.length;

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t(isPath ? 'picker.titlePath' : 'picker.titleContent')}
			size={960}
			centered
			fullScreen={isNarrow}
		>
			<Stack gap='md'>
				<div className={styles.layout}>
					<aside className={styles.rail}>
						{!isPath && (
							<Facet
								label={t('picker.filters.format')}
								options={formatOptions}
								value={filters.formats}
								onChange={(formats) => patch({ formats })}
							/>
						)}
						<Facet
							label={t('picker.filters.area')}
							options={areaOptions}
							value={filters.areas}
							onChange={(areas) => patch({ areas, subItem: null })}
						/>
						{!isPath && (
							<Select
								size='sm'
								label={t('picker.filters.subject')}
								placeholder={t('picker.filters.allSubjects')}
								data={subjectOptions}
								value={filters.subItem}
								onChange={(subItem) => patch({ subItem })}
								searchable
								clearable
								comboboxProps={{
									width: 'max-content',
									position: 'bottom-start',
								}}
							/>
						)}
						<Facet
							label={t('picker.filters.level')}
							options={levelOptions}
							value={filters.levels}
							onChange={(levels) => patch({ levels })}
						/>
						{!isPath && tagOptions.length > 0 && (
							<Input.Wrapper label={t('picker.filters.tags')}>
								<Chip.Group
									multiple
									value={filters.tags}
									onChange={(tags) => patch({ tags })}
								>
									<Group gap={6} mt={6}>
										{tagOptions.map((tag) => (
											<Chip key={tag} value={tag} size='xs' variant='outline'>
												{tag}
											</Chip>
										))}
									</Group>
								</Chip.Group>
							</Input.Wrapper>
						)}
					</aside>

					<section className={styles.results}>
						<Group gap='sm' align='flex-end' wrap='wrap'>
							<TextInput
								flex={1}
								miw={200}
								aria-label={t('picker.search')}
								placeholder={t('picker.search')}
								leftSection={<IconSearch size={16} />}
								value={filters.search}
								onChange={(e) => patch({ search: e.currentTarget.value })}
							/>
							{!isPath && (
								<AppSegmentedControl
									size='sm'
									aria-label={t('picker.groupBy.label')}
									value={groupBy}
									onChange={(v) => setGroupBy(v as GroupBy)}
									data={[
										{ label: t('picker.groupBy.FORMAT'), value: 'FORMAT' },
										{ label: t('picker.groupBy.SUBJECT'), value: 'SUBJECT' },
										{ label: t('picker.groupBy.AREA'), value: 'AREA' },
										{ label: t('picker.groupBy.NONE'), value: 'NONE' },
									]}
								/>
							)}
						</Group>

						{resultCount === 0 ? (
							<EmptyState
								message={t(isPath ? 'picker.emptyPaths' : 'picker.empty')}
							/>
						) : isPath ? (
							<Radio.Group
								value={draft[0] ?? null}
								onChange={(id) => setDraft([id])}
								aria-label={t('picker.titlePath')}
							>
								<div className={styles.list}>
									{matchingPaths.map((path) => (
										<Radio.Card
											key={path.id}
											value={path.id}
											radius='md'
											withBorder
											className={styles.card}
											checked={draft[0] === path.id}
											onClick={() => setDraft([path.id])}
										>
											<Group wrap='nowrap' align='flex-start' gap='sm'>
												<Radio.Indicator mt={2} />
												<Stack gap={4} flex={1} miw={0}>
													<Text size='sm' fw={600} lineClamp={1}>
														{path.title}
													</Text>
													<Text size='xs' c='dimmed' lineClamp={2}>
														{path.description}
													</Text>
													<Group gap='xs' wrap='wrap'>
														<AreaBadge area={path.area} size='xs' />
														<Text size='xs' c='dimmed'>
															{t(`levels.${path.level}`)} ·{' '}
															{t('picker.modules', {
																count: path.modules.length,
															})}{' '}
															·{' '}
															{t('common.minutes', {
																count: path.estimatedMin,
															})}
														</Text>
													</Group>
													<Text size='xs' c='dimmed' lineClamp={2}>
														{path.modules
															.map(
																(m) =>
																	content.find((c) => c.id === m.contentId)
																		?.title
															)
															.filter(Boolean)
															.join(' → ')}
													</Text>
												</Stack>
											</Group>
										</Radio.Card>
									))}
								</div>
							</Radio.Group>
						) : (
							<div className={styles.list}>
								{groups.map((group) => (
									<div key={group.key} className={styles.group}>
										{groupBy !== 'NONE' && (
											<Text size='sm' fw={600}>
												{group.label}{' '}
												<Text span size='xs' c='dimmed'>
													{group.items.length}
												</Text>
											</Text>
										)}
										{group.items.map((c) => (
											<Checkbox.Card
												key={c.id}
												radius='md'
												withBorder
												className={styles.card}
												checked={draft.includes(c.id)}
												onChange={() => toggle(c.id)}
											>
												<Group wrap='nowrap' align='flex-start' gap='sm'>
													<Checkbox.Indicator mt={2} />
													<Stack gap={4} flex={1} miw={0}>
														<Text size='sm' fw={600} lineClamp={1}>
															{c.title}
														</Text>
														<Text size='xs' c='dimmed' lineClamp={2}>
															{c.summary}
														</Text>
														<Group gap='xs' wrap='wrap'>
															<FormatBadge format={c.format} size='xs' />
															<AreaBadge
																area={c.area}
																subItem={c.subItem}
																size='xs'
															/>
															<Text size='xs' c='dimmed'>
																{t(`levels.${c.level}`)} ·{' '}
																{t('common.minutes', { count: c.durationMin })}
															</Text>
														</Group>
													</Stack>
												</Group>
											</Checkbox.Card>
										))}
									</div>
								))}
							</div>
						)}
					</section>
				</div>

				<Group justify='space-between'>
					<Group gap='sm'>
						<Text size='sm' c='dimmed'>
							{t(isPath ? 'picker.pathsCount' : 'picker.count', {
								count: resultCount,
							})}
						</Text>
						{hasFilters(filters) && (
							<Button
								size='compact-sm'
								variant='subtle'
								onClick={() => setFilters(EMPTY_FILTERS)}
							>
								{t('picker.clear')}
							</Button>
						)}
					</Group>
					<Group gap='sm'>
						<Button variant='default' onClick={onClose}>
							{t('common.cancel')}
						</Button>
						<Button onClick={confirm} disabled={draft.length === 0}>
							{isPath
								? t('picker.usePath')
								: t('picker.add', { count: draft.length })}
						</Button>
					</Group>
				</Group>
			</Stack>
		</Modal>
	);
}

export default MaterialPickerModal;
