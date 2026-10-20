import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Badge,
	Button,
	Group,
	Select,
	Stack,
	Text,
	TextInput,
	Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
	IconBuildingStore,
	IconLock,
	IconPencil,
	IconPlus,
	IconSearch,
	IconTrash,
} from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import {
	selectCampaignTypes,
	useGlobalConfigStore,
} from '~/stores/qa/globalConfigStore';
import { CampaignTypeDrawer } from '../components/CampaignTypeDrawer';
import { StatusDot } from '../components/StatusDot';
import type { CampaignTypeEntry, ConfigStatus } from '../types';

type StatusFilter = 'ALL' | ConfigStatus;

/** The client's catalogue of campaign types, used by campaign assignments and COPC question tags. */
export const CampaignTypesTab: React.FC = () => {
	const { t } = useTranslation('qa.globalConfig');
	const entries = useGlobalConfigStore(selectCampaignTypes);
	const upsert = useGlobalConfigStore((s) => s.upsertCampaignType);
	const remove = useGlobalConfigStore((s) => s.deleteCampaignType);

	const [search, setSearch] = useState('');
	const [status, setStatus] = useState<StatusFilter>('ALL');
	const [drawer, setDrawer] = useState<{
		opened: boolean;
		entry?: CampaignTypeEntry;
	}>({ opened: false });

	const filtered = useMemo(() => {
		const needle = search.trim().toUpperCase();
		return entries.filter(
			(entry) =>
				(needle === '' || entry.code.includes(needle)) &&
				(status === 'ALL' || entry.status === status)
		);
	}, [entries, search, status]);

	const confirmDelete = (entry: CampaignTypeEntry) =>
		modals.openConfirmModal({
			title: t('campaignTypes.delete.title'),
			children: (
				<Text size='sm'>
					{t('campaignTypes.delete.message', { code: entry.code })}
				</Text>
			),
			labels: {
				confirm: t('common.actions.delete'),
				cancel: t('common.cancel'),
			},
			confirmProps: { color: 'red' },
			onConfirm: () => remove(entry.code),
		});

	const columns: BaseTableColumnDef<CampaignTypeEntry>[] = [
		{
			accessorKey: 'code',
			header: t('campaignTypes.columns.code'),
			size: 260,
			cell: ({ row }) => (
				<Group gap='xs' wrap='nowrap'>
					<Badge
						variant='light'
						color='gray'
						size='sm'
						ff='monospace'
						tt='none'
					>
						{row.original.code}
					</Badge>
					{row.original.locked && (
						<Tooltip label={t('campaignTypes.lockedHint')} withArrow>
							<IconLock size={14} stroke={1.5} />
						</Tooltip>
					)}
				</Group>
			),
		},
		{
			accessorKey: 'name',
			header: t('campaignTypes.columns.name'),
			cell: ({ row }) => (
				<Stack gap={0}>
					<Text size='sm' fw={600}>
						{row.original.name}
					</Text>
					<Text size='xs' c='dimmed' lineClamp={1}>
						{row.original.description ?? t('common.notAvailable')}
					</Text>
				</Stack>
			),
		},
		{
			accessorKey: 'status',
			header: t('common.status'),
			size: 140,
			cell: ({ row }) => <StatusDot status={row.original.status} />,
		},
		{
			id: 'actions',
			header: t('common.actionsHeader'),
			size: 110,
			cell: ({ row }) => {
				const entry = row.original;
				return (
					<Group gap={4} wrap='nowrap'>
						<ActionIcon
							variant='subtle'
							color='gray'
							aria-label={t('common.actions.edit')}
							disabled={entry.locked}
							onClick={() => setDrawer({ opened: true, entry })}
						>
							<IconPencil size={16} />
						</ActionIcon>
						<ActionIcon
							variant='subtle'
							color='red'
							aria-label={t('common.actions.delete')}
							disabled={entry.locked}
							onClick={() => confirmDelete(entry)}
						>
							<IconTrash size={16} />
						</ActionIcon>
					</Group>
				);
			},
		},
	];

	return (
		<Stack gap='lg'>
			<SectionCard
				icon={IconBuildingStore}
				title={t('campaignTypes.title')}
				description={t('campaignTypes.description')}
				headerActions={
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={() => setDrawer({ opened: true })}
					>
						{t('campaignTypes.create')}
					</Button>
				}
			>
				<Stack gap='md'>
					<Group justify='space-between' align='flex-end' wrap='wrap'>
						<Group gap='sm' align='flex-end'>
							<TextInput
								label={t('campaignTypes.columns.code')}
								placeholder={t('campaignTypes.searchCode')}
								leftSection={<IconSearch size={16} />}
								value={search}
								onChange={(event) => setSearch(event.currentTarget.value)}
								w={240}
							/>
							<Select
								label={t('common.status')}
								data={[
									{ value: 'ALL', label: t('common.allStatuses') },
									{ value: 'ACTIVE', label: t('common.active') },
									{ value: 'INACTIVE', label: t('common.inactive') },
								]}
								value={status}
								onChange={(value) => value && setStatus(value as StatusFilter)}
								allowDeselect={false}
								comboboxProps={{ withinPortal: true }}
								w={200}
							/>
						</Group>
						<Text size='sm' c='dimmed'>
							{t('campaignTypes.count', { count: filtered.length })}
						</Text>
					</Group>

					<BaseTable<CampaignTypeEntry>
						data={filtered}
						columns={columns}
						getRowId={(entry) => entry.code}
						density='compact'
						emptyMessage={t('campaignTypes.empty')}
					/>
				</Stack>
			</SectionCard>

			<CampaignTypeDrawer
				opened={drawer.opened}
				entry={drawer.entry}
				existingCodes={entries.map((e) => e.code)}
				onClose={() => setDrawer({ opened: false })}
				onSave={upsert}
			/>
		</Stack>
	);
};

export default CampaignTypesTab;
