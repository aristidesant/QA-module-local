import { useMemo, useState } from 'react';
import {
	ActionIcon,
	Badge,
	Button,
	Group,
	Menu,
	Select,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import {
	IconArchive,
	IconDots,
	IconEye,
	IconLibrary,
	IconRestore,
	IconSearch,
	IconUpload,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import BaseTable, {
	type BaseTableColumnDef,
} from '~/components/BaseTable/BaseTable';
import EmptyState from '~/components/EmptyState';
import type { LmsContent, LmsContentStatus } from '~/models/qa';
import type { TeamRole } from '~/modules/qa/team/types';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { useLmsStore } from '~/stores/qa/lmsStore';
import {
	LMS_AREAS,
	LMS_AREA_META,
	LMS_FORMATS,
	LMS_LEVELS,
} from '../../constants';
import { AreaBadge, FormatBadge } from '../../components/Badges';

const helper = createColumnHelper<LmsContent>();

const STATUS_COLOR: Record<LmsContentStatus, string> = {
	PUBLISHED: 'green',
	DRAFT: 'yellow',
	ARCHIVED: 'gray',
};

interface LibraryTabProps {
	content: LmsContent[];
	role: TeamRole;
	onOpenContent: (contentId: string) => void;
	onAssign: (contentId: string) => void;
	onPreview: (contentId: string) => void;
}

export function LibraryTab({
	content,
	role,
	onOpenContent,
	onAssign,
	onPreview,
}: LibraryTabProps) {
	const { t } = useTranslation('qa.lms');
	const isQaManager = role === 'qa-manager';

	const [search, setSearch] = useState('');
	const [format, setFormat] = useState<string | null>(null);
	const [area, setArea] = useState<string | null>(null);
	const [status, setStatus] = useState<string | null>(null);
	const [level, setLevel] = useState<string | null>(null);

	const visible = useMemo(
		() =>
			isQaManager ? content : content.filter((c) => c.status === 'PUBLISHED'),
		[content, isQaManager]
	);

	const rows = useMemo(() => {
		const q = search.trim().toLowerCase();
		return visible.filter((c) => {
			if (
				q &&
				!c.title.toLowerCase().includes(q) &&
				!c.tags.some((tag) => tag.includes(q))
			)
				return false;
			if (format && c.format !== format) return false;
			if (area && c.area !== area) return false;
			if (status && c.status !== status) return false;
			if (level && c.level !== level) return false;
			return true;
		});
	}, [visible, search, format, area, status, level]);

	const handleStatus = (contentId: string, next: LmsContentStatus) => {
		useLmsStore.getState().setContentStatus(contentId, next);
		notifySuccess(
			next === 'PUBLISHED'
				? t('manager.library.notifications.published')
				: t('manager.library.notifications.archived')
		);
	};

	const columns: BaseTableColumnDef<LmsContent>[] = [
		helper.accessor('title', {
			header: t('manager.library.columns.title'),
			cell: (info) => (
				<Stack gap={2}>
					<Text size='sm' fw={500}>
						{info.getValue()}
					</Text>
					{info.row.original.tags.length > 0 && (
						<Group gap={4}>
							{info.row.original.tags.map((tag) => (
								<Badge key={tag} size='xs' variant='dot' color='gray'>
									{tag}
								</Badge>
							))}
						</Group>
					)}
				</Stack>
			),
		}) as BaseTableColumnDef<LmsContent>,
		helper.display({
			id: 'format',
			header: t('manager.library.columns.format'),
			cell: (info) => (
				<FormatBadge format={info.row.original.format} size='xs' />
			),
		}) as BaseTableColumnDef<LmsContent>,
		helper.display({
			id: 'area',
			header: t('manager.library.columns.area'),
			cell: (info) => <AreaBadge area={info.row.original.area} size='xs' />,
		}) as BaseTableColumnDef<LmsContent>,
		helper.accessor('durationMin', {
			header: t('manager.library.columns.duration'),
			cell: (info) => (
				<Text size='sm'>{t('common.minutes', { count: info.getValue() })}</Text>
			),
		}) as BaseTableColumnDef<LmsContent>,
		helper.accessor('level', {
			header: t('manager.library.columns.level'),
			cell: (info) => (
				<Badge size='xs' variant='default'>
					{t(`levels.${info.getValue()}`)}
				</Badge>
			),
		}) as BaseTableColumnDef<LmsContent>,
		helper.accessor((c) => c.stats.assigned, {
			id: 'assigned',
			header: t('manager.library.columns.assigned'),
			cell: (info) => <Text size='sm'>{info.getValue()}</Text>,
		}) as BaseTableColumnDef<LmsContent>,
	];

	if (isQaManager) {
		columns.push(
			helper.accessor('status', {
				header: t('manager.library.columns.status'),
				cell: (info) => (
					<Badge
						size='sm'
						color={STATUS_COLOR[info.getValue()]}
						variant='light'
					>
						{t(`manager.library.contentStatus.${info.getValue()}`)}
					</Badge>
				),
			}) as BaseTableColumnDef<LmsContent>
		);
	}

	columns.push(
		helper.display({
			id: 'actions',
			header: '',
			cell: (info) => {
				const c = info.row.original;
				return (
					<Group
						gap={4}
						justify='flex-end'
						onClick={(e) => e.stopPropagation()}
					>
						<Button
							size='compact-xs'
							variant='light'
							onClick={() => onAssign(c.id)}
							disabled={c.status !== 'PUBLISHED'}
						>
							{t('manager.library.actions.assign')}
						</Button>
						<Menu withinPortal position='bottom-end'>
							<Menu.Target>
								<ActionIcon variant='subtle' size='sm'>
									<IconDots size={16} />
								</ActionIcon>
							</Menu.Target>
							<Menu.Dropdown>
								<Menu.Item
									leftSection={<IconEye size={14} />}
									onClick={() => onPreview(c.id)}
								>
									{t('manager.library.actions.preview')}
								</Menu.Item>
								{isQaManager && c.status !== 'PUBLISHED' && (
									<Menu.Item
										leftSection={<IconUpload size={14} />}
										onClick={() => handleStatus(c.id, 'PUBLISHED')}
									>
										{c.status === 'ARCHIVED'
											? t('manager.library.actions.restore')
											: t('manager.library.actions.publish')}
									</Menu.Item>
								)}
								{isQaManager && c.status === 'PUBLISHED' && (
									<Menu.Item
										leftSection={<IconArchive size={14} />}
										color='red'
										onClick={() => handleStatus(c.id, 'ARCHIVED')}
									>
										{t('manager.library.actions.archive')}
									</Menu.Item>
								)}
								{isQaManager && c.status === 'ARCHIVED' && (
									<Menu.Item
										leftSection={<IconRestore size={14} />}
										onClick={() => handleStatus(c.id, 'PUBLISHED')}
									>
										{t('manager.library.actions.restore')}
									</Menu.Item>
								)}
							</Menu.Dropdown>
						</Menu>
					</Group>
				);
			},
		}) as BaseTableColumnDef<LmsContent>
	);

	const clearFilters = () => {
		setSearch('');
		setFormat(null);
		setArea(null);
		setStatus(null);
		setLevel(null);
	};

	return (
		<SectionCard
			title={t('manager.library.title')}
			description={t('manager.library.description')}
			icon={IconLibrary}
			headerActions={
				<Text size='sm' c='dimmed'>
					{t('manager.library.count', { count: rows.length })}
				</Text>
			}
		>
			<Stack gap='md'>
				<Group gap='sm' align='flex-end' wrap='wrap'>
					<TextInput
						size='sm'
						placeholder={t('manager.library.filters.search')}
						leftSection={<IconSearch size={16} />}
						value={search}
						onChange={(e) => setSearch(e.currentTarget.value)}
						miw={220}
					/>
					<Select
						size='sm'
						placeholder={t('manager.library.filters.format')}
						data={LMS_FORMATS.map((f) => ({
							value: f,
							label: t(`formats.${f}`),
						}))}
						value={format}
						onChange={setFormat}
						clearable
						w={150}
					/>
					<Select
						size='sm'
						placeholder={t('manager.library.filters.area')}
						data={LMS_AREAS.map((a) => ({
							value: a,
							label: t(LMS_AREA_META[a].labelKey),
						}))}
						value={area}
						onChange={setArea}
						clearable
						w={190}
					/>
					<Select
						size='sm'
						placeholder={t('manager.library.filters.level')}
						data={LMS_LEVELS.map((l) => ({
							value: l,
							label: t(`levels.${l}`),
						}))}
						value={level}
						onChange={setLevel}
						clearable
						w={150}
					/>
					{isQaManager && (
						<Select
							size='sm'
							placeholder={t('manager.library.filters.status')}
							data={(
								['PUBLISHED', 'DRAFT', 'ARCHIVED'] as LmsContentStatus[]
							).map((s) => ({
								value: s,
								label: t(`manager.library.contentStatus.${s}`),
							}))}
							value={status}
							onChange={setStatus}
							clearable
							w={150}
						/>
					)}
					<Button size='sm' variant='subtle' onClick={clearFilters}>
						{t('manager.library.filters.clear')}
					</Button>
				</Group>

				{rows.length === 0 ? (
					<EmptyState message={t('manager.library.empty')} />
				) : (
					<BaseTable<LmsContent>
						data={rows}
						columns={columns}
						getRowId={(r) => r.id}
						initialSort={[{ id: 'assigned', desc: true }]}
						density='compact'
						enablePagination
						pageSize={10}
						showPaginationControls
						emptyMessage={t('manager.library.empty')}
						onRowClick={(r) => onOpenContent(r.id)}
					/>
				)}
			</Stack>
		</SectionCard>
	);
}
