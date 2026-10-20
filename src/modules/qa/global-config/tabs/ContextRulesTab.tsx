import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Alert,
	Anchor,
	Badge,
	Button,
	Collapse,
	Group,
	List,
	Menu,
	SegmentedControl,
	Select,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import {
	IconBook2,
	IconCopy,
	IconDotsVertical,
	IconEdit,
	IconEye,
	IconFileTypeDoc,
	IconInfoCircle,
	IconPlayerPause,
	IconPlayerPlay,
	IconPlus,
	IconSearch,
	IconTrash,
} from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import {
	selectContextRules,
	useGlobalConfigStore,
} from '~/stores/qa/globalConfigStore';
import { CodeText } from '../components/CodeText';
import { ContextRuleDrawer } from '../components/ContextRuleDrawer';
import { ProtocolDocumentsDrawer } from '../components/ProtocolDocumentsDrawer';
import { RulePreviewDrawer } from '../components/RulePreviewDrawer';
import { StatusDot } from '../components/StatusDot';
import { ACTIVE_CLIENT_NAME } from '../constants';
import { overriddenBy } from '../helpers';
import type { ConfigStatus, ContextRule, RuleScope } from '../types';

type ScopeFilter = 'ALL' | RuleScope;
type StatusFilter = 'ALL' | ConfigStatus;

/** Manual rules per topic and scope, plus the Word protocols attached to a line of business. */
export const ContextRulesTab: React.FC = () => {
	const { t } = useTranslation('qa.globalConfig');
	const rules = useGlobalConfigStore(selectContextRules);
	const upsert = useGlobalConfigStore((s) => s.upsertContextRule);
	const toggle = useGlobalConfigStore((s) => s.toggleContextRule);
	const remove = useGlobalConfigStore((s) => s.deleteContextRule);
	const duplicate = useGlobalConfigStore((s) => s.duplicateContextRule);

	const [search, setSearch] = useState('');
	const [scope, setScope] = useState<ScopeFilter>('ALL');
	const [status, setStatus] = useState<StatusFilter>('ALL');
	const [howOpen, setHowOpen] = useState(false);
	const [docsOpened, setDocsOpened] = useState(false);
	const [previewOpened, setPreviewOpened] = useState(false);
	const [drawer, setDrawer] = useState<{ opened: boolean; rule?: ContextRule }>(
		{ opened: false }
	);

	const counts = useMemo(
		() => ({
			ALL: rules.length,
			CLIENT: rules.filter((r) => r.scope === 'CLIENT').length,
			CAMPAIGN_TYPE: rules.filter((r) => r.scope === 'CAMPAIGN_TYPE').length,
			CAMPAIGN: rules.filter((r) => r.scope === 'CAMPAIGN').length,
		}),
		[rules]
	);

	const filtered = useMemo(() => {
		const needle = search.trim().toLowerCase();
		return rules.filter(
			(rule) =>
				(scope === 'ALL' || rule.scope === scope) &&
				(status === 'ALL' || rule.status === status) &&
				(needle === '' ||
					rule.topic.toLowerCase().includes(needle) ||
					rule.target.toLowerCase().includes(needle) ||
					rule.context.toLowerCase().includes(needle))
		);
	}, [rules, search, scope, status]);

	const targetLabel = (rule: ContextRule) =>
		rule.scope === 'CLIENT' ? t('contextRules.allCampaigns') : rule.target;

	const columns: BaseTableColumnDef<ContextRule>[] = [
		{
			accessorKey: 'topic',
			header: t('contextRules.columns.topic'),
			size: 260,
			cell: ({ row }) => {
				const by = overriddenBy(row.original, rules);
				return (
					<Stack gap={2}>
						<CodeText>{row.original.topic}</CodeText>
						{by && (
							<Text size='xs' c='dimmed'>
								{t('contextRules.overriddenBy', {
									scope: t(`contextRules.scope.${by}`),
								})}
							</Text>
						)}
					</Stack>
				);
			},
		},
		{
			accessorKey: 'target',
			header: t('contextRules.columns.appliesTo'),
			size: 260,
			cell: ({ row }) => (
				<Stack gap={4}>
					<Text size='sm' fw={600}>
						{targetLabel(row.original)}
					</Text>
					<Group gap={4}>
						<Badge variant='light' color='gray' size='xs'>
							{t(`contextRules.scope.${row.original.scope}`)}
						</Badge>
						<Badge variant='outline' color='gray' size='xs'>
							{t(`contextRules.agentType.${row.original.agentType}`)}
						</Badge>
					</Group>
				</Stack>
			),
		},
		{
			accessorKey: 'context',
			header: t('contextRules.columns.context'),
			enableSorting: true,
			cell: ({ row }) => (
				<Text size='sm' lineClamp={1}>
					{row.original.context}
				</Text>
			),
		},
		{
			accessorKey: 'status',
			header: t('common.status'),
			size: 130,
			cell: ({ row }) => <StatusDot status={row.original.status} />,
		},
		{
			id: 'actions',
			header: t('contextRules.columns.actions'),
			size: 70,
			cell: ({ row }) => {
				const rule = row.original;
				return (
					<Menu withinPortal position='bottom-end'>
						<Menu.Target>
							<ActionIcon
								variant='subtle'
								color='gray'
								aria-label={t('contextRules.columns.actions')}
							>
								<IconDotsVertical size={16} />
							</ActionIcon>
						</Menu.Target>
						<Menu.Dropdown>
							<Menu.Item
								leftSection={<IconEdit size={14} />}
								onClick={() => setDrawer({ opened: true, rule })}
							>
								{t('common.actions.edit')}
							</Menu.Item>
							<Menu.Item
								leftSection={<IconCopy size={14} />}
								onClick={() => duplicate(rule.id)}
							>
								{t('common.actions.duplicate')}
							</Menu.Item>
							<Menu.Item
								leftSection={
									rule.status === 'ACTIVE' ? (
										<IconPlayerPause size={14} />
									) : (
										<IconPlayerPlay size={14} />
									)
								}
								onClick={() => toggle(rule.id)}
							>
								{t(
									rule.status === 'ACTIVE'
										? 'common.actions.deactivate'
										: 'common.actions.activate'
								)}
							</Menu.Item>
							<Menu.Divider />
							<Menu.Item
								color='red'
								leftSection={<IconTrash size={14} />}
								onClick={() => remove(rule.id)}
							>
								{t('common.actions.delete')}
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				);
			},
		},
	];

	return (
		<Stack gap='lg'>
			<SectionCard
				icon={IconBook2}
				title={t('contextRules.title')}
				description={t('contextRules.description')}
				headerActions={
					<Group gap='sm' wrap='nowrap'>
						<Button
							variant='default'
							leftSection={<IconFileTypeDoc size={16} />}
							onClick={() => setDocsOpened(true)}
						>
							{t('contextRules.docs.title')}
						</Button>
						<Button
							variant='default'
							leftSection={<IconEye size={16} />}
							onClick={() => setPreviewOpened(true)}
						>
							{t('contextRules.preview')}
						</Button>
						<Button
							leftSection={<IconPlus size={16} />}
							onClick={() => setDrawer({ opened: true })}
						>
							{t('contextRules.add')}
						</Button>
					</Group>
				}
			>
				<Stack gap='md'>
					<Alert
						variant='light'
						color='blue'
						icon={<IconInfoCircle size={18} />}
					>
						<Stack gap={4}>
							<Text size='sm'>
								{t('contextRules.howRules.summary', {
									client: ACTIVE_CLIENT_NAME,
								})}
							</Text>
							<Anchor
								size='sm'
								component='button'
								type='button'
								onClick={() => setHowOpen((open) => !open)}
							>
								{t('contextRules.howRules.link')}
							</Anchor>
							<Collapse expanded={howOpen}>
								<List size='sm' spacing={2}>
									<List.Item>
										{t('contextRules.howRules.bullets.one')}
									</List.Item>
									<List.Item>
										{t('contextRules.howRules.bullets.two')}
									</List.Item>
									<List.Item>
										{t('contextRules.howRules.bullets.three')}
									</List.Item>
								</List>
							</Collapse>
						</Stack>
					</Alert>

					<Group justify='space-between' align='center' wrap='wrap' gap='sm'>
						<TextInput
							placeholder={t('contextRules.searchPlaceholder')}
							leftSection={<IconSearch size={16} />}
							value={search}
							onChange={(event) => setSearch(event.currentTarget.value)}
							flex='1 1 280px'
						/>
						<Group gap='sm' wrap='nowrap'>
							<SegmentedControl
								data={[
									{
										value: 'ALL',
										label: `${t('contextRules.filters.all')} (${counts.ALL})`,
									},
									{
										value: 'CLIENT',
										label: `${t('contextRules.filters.client')} (${counts.CLIENT})`,
									},
									{
										value: 'CAMPAIGN_TYPE',
										label: `${t('contextRules.filters.campaignTypes')} (${counts.CAMPAIGN_TYPE})`,
									},
									{
										value: 'CAMPAIGN',
										label: `${t('contextRules.filters.campaigns')} (${counts.CAMPAIGN})`,
									},
								]}
								value={scope}
								onChange={(value) => setScope(value as ScopeFilter)}
							/>
							<Select
								data={[
									{ value: 'ALL', label: t('common.allStatuses') },
									{ value: 'ACTIVE', label: t('common.active') },
									{ value: 'INACTIVE', label: t('common.inactive') },
								]}
								value={status}
								onChange={(value) => value && setStatus(value as StatusFilter)}
								allowDeselect={false}
								comboboxProps={{ withinPortal: true }}
								w={180}
							/>
						</Group>
					</Group>

					<BaseTable<ContextRule>
						data={filtered}
						columns={columns}
						getRowId={(rule) => rule.id}
						density='compact'
						emptyMessage={t('contextRules.empty')}
					/>
				</Stack>
			</SectionCard>

			<ContextRuleDrawer
				opened={drawer.opened}
				rule={drawer.rule}
				onClose={() => setDrawer({ opened: false })}
				onSave={upsert}
			/>
			<ProtocolDocumentsDrawer
				opened={docsOpened}
				onClose={() => setDocsOpened(false)}
			/>
			<RulePreviewDrawer
				opened={previewOpened}
				onClose={() => setPreviewOpened(false)}
			/>
		</Stack>
	);
};

export default ContextRulesTab;
