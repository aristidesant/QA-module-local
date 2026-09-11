import { Button, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useTranslation } from 'react-i18next';
import { useMemo, useState, useEffect, useCallback } from 'react';
import type { RuleKind, RuleType, TriggerRule, TriggerActivityEntry } from '~/models/qa';
import { SectionCard } from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { SEVERITY_ORDER, STATUS_ORDER } from '~/modules/qa/triggers/helpers';
import { getRuleArea } from '~/modules/qa/triggers/helpers';
import RulesFilters, { type RulesFilterValues } from '../RulesFilters';
import RulesTable from '../RulesTable';
import RuleDetailDrawer from '../RuleDetailDrawer';

interface RulesTabProps {
	kind: RuleKind;
	onCreate: (type?: RuleType) => void;
	onEdit: (rule: TriggerRule) => void;
	onOpenActivity?: (entry: TriggerActivityEntry) => void;
	onAcknowledgeActivity?: (entryId: string) => void;
	detailRuleId?: string | null;
	onDetailRuleHandled?: () => void;
}

const defaultFilters: RulesFilterValues = {
	search: '',
	type: null,
	area: null,
	status: 'ALL',
	recipient: null,
};

export default function RulesTab({
	kind, onCreate, onEdit, onOpenActivity, onAcknowledgeActivity, detailRuleId, onDetailRuleHandled,
}: RulesTabProps) {
	const { t } = useTranslation('qa.triggers');
	const { rules, deleteRule, setRuleStatus, duplicateRule } = useTriggerRulesStore();

	const [filters, setFilters] = useState<RulesFilterValues>(defaultFilters);
	const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);

	const handleClearFilters = useCallback(() => {
		setFilters(defaultFilters);
	}, []);

	useEffect(() => {
		if (detailRuleId) {
			setSelectedRuleId(detailRuleId);
			if (onDetailRuleHandled) {
				onDetailRuleHandled();
			}
		}
	}, [detailRuleId]);

	const kindRules = useMemo(() => rules.filter((r) => r.kind === kind), [rules, kind]);

	const filteredRules = useMemo(() => {
		let result = kindRules;

		// Search filter
		if (filters.search) {
			const q = filters.search.toLowerCase();
			result = result.filter((r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
		}

		// Type filter
		if (filters.type) {
			result = result.filter((r) => r.type === filters.type);
		}

		// Area filter
		if (filters.area) {
			result = result.filter((r) => getRuleArea(r) === filters.area);
		}

		// Status filter
		if (filters.status !== 'ALL') {
			result = result.filter((r) => r.status === filters.status);
		}

		// Recipient filter
		if (filters.recipient) {
			const recipient = filters.recipient;
			result = result.filter((r) => r.delivery.recipients.includes(recipient));
		}

		// Sort: status order, severity order, name
		result.sort((a, b) => {
			const statusCmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
			if (statusCmp !== 0) return statusCmp;
			const severityCmp = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
			if (severityCmp !== 0) return severityCmp;
			return a.name.localeCompare(b.name);
		});

		return result;
	}, [kindRules, filters]);

	const selectedRule = selectedRuleId ? filteredRules.find((r) => r.id === selectedRuleId) : null;

	const handleToggle = (rule: TriggerRule) => {
		const newStatus = rule.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
		setRuleStatus(rule.id, newStatus);
		notifySuccess(t(`rules.notifications.${newStatus === 'ACTIVE' ? 'activated' : 'paused'}`));
	};

	const handleDuplicate = (rule: TriggerRule) => {
		const copy = duplicateRule(rule.id);
		if (copy) {
			notifySuccess(t('rules.notifications.duplicated'));
			onEdit(copy);
		}
	};

	const handleDelete = (rule: TriggerRule) => {
		modals.openConfirmModal({
			title: t('rules.confirmDelete.title'),
			children: (
				// inline-style-allow: uses Mantine CSS variables
				<p style={{ fontSize: 'var(--mantine-font-size-sm)' }}>
					{t('rules.confirmDelete.message', { name: rule.name })}
				</p>
			),
			labels: {
				confirm: t('rules.confirmDelete.confirm'),
				cancel: t('rules.confirmDelete.cancel'),
			},
			confirmProps: { color: 'red' },
			onConfirm: () => {
				deleteRule(rule.id);
				notifySuccess(t('rules.notifications.deleted'));
				setSelectedRuleId(null);
			},
		});
	};

	const handleSendTest = (_rule: TriggerRule) => {
		// TODO: Implement send test with notification building
		notifySuccess(t('rules.notifications.testSent', { agent: 'Sarah Johnson' }));
	};

	const isEmptyAfterFilters = kindRules.length > 0 && filteredRules.length === 0;
	const isCompletelyEmpty = kindRules.length === 0;

	const titleKey = kind === 'ALERT' ? 'rules.alertsTitle' : 'rules.recognitionTitle';
	const descKey = kind === 'ALERT' ? 'rules.alertsDescription' : 'rules.recognitionDescription';
	const newButtonKey = kind === 'ALERT' ? 'rules.newAlert' : 'rules.newRecognition';
	const emptyTitleKey = kind === 'ALERT' ? 'rules.empty.alertsTitle' : 'rules.empty.recognitionTitle';
	const emptyDescKey = kind === 'ALERT' ? 'rules.empty.alertsDescription' : 'rules.empty.recognitionDescription';

	return (
		<>
			{isCompletelyEmpty ? (
				<EmptyState
					icon={<></>}
					message={t(emptyTitleKey)}
					description={t(emptyDescKey)}
					action={
						<Button leftSection={<IconPlus size={16} />} onClick={() => onCreate()}>
							{t(newButtonKey)}
						</Button>
					}
				/>
			) : (
				<SectionCard
					title={t(titleKey)}
					description={t(descKey)}
					headerActions={
						<Button size="sm" leftSection={<IconPlus size={16} />} onClick={() => onCreate()}>
							{t(newButtonKey)}
						</Button>
					}
				>
					<Stack gap="md">
						<RulesFilters
							kind={kind}
							values={filters}
							onChange={setFilters}
							onClear={handleClearFilters}
						/>

						{isEmptyAfterFilters ? (
							<EmptyState
								message={t('rules.empty.noMatches')}
								action={
									<Button
										variant="light"
										size="sm"
										onClick={() => setFilters(defaultFilters)}
									>
										{t('rules.filters.clear')}
									</Button>
								}
							/>
						) : (
							<RulesTable
								kind={kind}
								rules={filteredRules}
								onRowClick={(rule) => setSelectedRuleId(rule.id)}
								onEdit={onEdit}
								onDuplicate={handleDuplicate}
								onDelete={handleDelete}
								onToggle={handleToggle}
								onSendTest={handleSendTest}
							/>
						)}
					</Stack>
				</SectionCard>
			)}

			<RuleDetailDrawer
				rule={selectedRule || null}
				opened={selectedRuleId !== null}
				onClose={() => setSelectedRuleId(null)}
				onEdit={onEdit}
				onDuplicate={handleDuplicate}
				onToggle={handleToggle}
				onDelete={handleDelete}
				onSendTest={handleSendTest}
				onOpenActivity={onOpenActivity ? (entry) => onOpenActivity(entry) : () => {}}
				onAcknowledgeActivity={onAcknowledgeActivity ? (entryId) => onAcknowledgeActivity(entryId) : () => {}}
			/>
		</>
	);
}
