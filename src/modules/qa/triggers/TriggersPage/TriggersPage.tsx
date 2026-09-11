import {
	createContext, useContext, useMemo, useState, useCallback,
} from 'react';
import { useLocation } from 'react-router';
import {
	Stack, Group, Title, Text, Button, Tabs, Badge,
} from '@mantine/core';
import { IconPlus, IconAlertTriangle, IconSparkles, IconAward, IconTemplate, IconHistory } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import ContentContainer from '~/components/ContentContainer';
import TriggersKpiStrip from '../components/TriggersKpiStrip';
import RuleTypePickerModal from '../components/RuleTypePickerModal';
import RulesTab from '../components/RulesTab';
import BadgesTab from '../components/BadgesTab';
import { TemplatesTab } from '../components/TemplatesTab';
import { RuleEditorDrawer } from '../components/RuleEditorDrawer';
import ActivityTab from '../components/ActivityTab';
import ActivityDetailDrawer from '../components/ActivityDetailDrawer';
import { useTriggerRulesStore } from '~/stores/qa/triggerRulesStore';
import type { RuleType, TriggerRule, TriggerActivityEntry } from '~/models/qa';

interface TriggersPageContextType {
	role: 'supervisor' | 'qaManager';
	inboxPath: string;
	defaultSupervisorIds: string[];
}

const TriggersPageContext = createContext<TriggersPageContextType | null>(null);

export const useTriggersPageContext = (): TriggersPageContextType => {
	const ctx = useContext(TriggersPageContext);
	if (!ctx) {
		throw new Error('useTriggersPageContext must be used within TriggersPage');
	}
	return ctx;
};

export default function TriggersPage() {
	const { t } = useTranslation('qa.triggers');
	const location = useLocation();
	const { rules, badges, templates, activity } = useTriggerRulesStore();

	// Determine role from path
	const role = location.pathname.includes('/qa/supervisor/') ? 'supervisor' : 'qaManager';
	const inboxPath = role === 'supervisor' ? '/qa/supervisor/inbox' : '/qa/qa-manager/inbox';
	const defaultSupervisorIds = role === 'supervisor' ? ['SUP-001'] : [];

	// State management
	const [tab, setTab] = useState<string | null>('alerts');
	const [pickerOpened, setPickerOpened] = useState(false);
	const [editorState, setEditorState] = useState<{
		opened: boolean;
		mode: 'create' | 'edit';
		type: RuleType;
		rule: TriggerRule | null;
		badgePreset?: Partial<any>;
	}>({ opened: false, mode: 'create', type: 'METRIC_ALERT', rule: null });
	const [detailRuleId, setDetailRuleId] = useState<string | null>(null);
	const [detailActivityEntry, setDetailActivityEntry] = useState<TriggerActivityEntry | null>(null);

	// Compute KPI counts
	const tabCounts = useMemo(() => {
		const alertRules = rules.filter((r) => r.kind === 'ALERT').length;
		const recognitionRules = rules.filter((r) => r.kind === 'RECOGNITION').length;
		const activeBadges = badges.filter((b) => b.status === 'ACTIVE').length;
		const sentActivity = activity.filter((a) => a.status === 'SENT').length;

		return { alertRules, recognitionRules, activeBadges, sentActivity };
	}, [rules, badges, activity]);

	// Memoized callbacks to prevent unnecessary re-renders of child components
	const handlePickerSelect = useCallback((type: RuleType) => {
		// Note: editorState will be used in Task 6 for RuleEditorDrawer
		setEditorState({
			opened: true,
			mode: 'create',
			type,
			rule: null,
		});
		// Switch tab to matching kind
		const kind = type === 'METRIC_ALERT' || type === 'TREND_WARNING' || type === 'WEEKLY_SUMMARY' || type === 'BURNOUT_RISK' ? 'alerts' : 'recognition';
		setTab(kind);
	}, []);

	const handleCreateRule = useCallback((type?: RuleType) => {
		if (type) {
			setEditorState({ opened: true, mode: 'create', type, rule: null });
		} else {
			setPickerOpened(true);
		}
	}, []);

	const handleEditRule = useCallback((rule: TriggerRule) => {
		setEditorState({ opened: true, mode: 'edit', type: rule.type, rule });
	}, []);

	const handleDetailRuleHandled = useCallback(() => {
		setDetailRuleId(null);
	}, []);

	const handleAcknowledgeActivity = useCallback((entryId: string) => {
		useTriggerRulesStore.getState().acknowledgeActivity(entryId);
		notifySuccess(t('activity.notifications.acknowledged'));
	}, [t]);

	return (
		<TriggersPageContext.Provider value={{ role, inboxPath, defaultSupervisorIds }}>
			<ContentContainer contentWidth='full'>
				<Stack gap='lg'>
					{/* Header */}
					<Group justify='space-between' align='flex-start'>
						<Stack gap={0} flex={1}>
							<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
								{t(`page.eyebrow.${role === 'supervisor' ? 'supervisor' : 'qaManager'}`)}
							</Text>
							<Title order={1}>{t('page.title')}</Title>
							<Text c='dimmed' size='sm'>
								{t('page.description')}
							</Text>
						</Stack>
						<Button
							leftSection={<IconPlus size={16} />}
							onClick={() => setPickerOpened(true)}
						>
							{t('page.newRule')}
						</Button>
					</Group>

					{/* KPI Strip */}
					<TriggersKpiStrip />

					{/* Tabs */}
					<Tabs value={tab} onChange={setTab}>
						<Tabs.List>
							<Tabs.Tab
								value='alerts'
								leftSection={<IconAlertTriangle size={16} />}
								rightSection={
									<Badge size='xs' variant='light'>
										{tabCounts.alertRules}
									</Badge>
								}
							>
								{t('page.tabs.alerts')}
							</Tabs.Tab>
							<Tabs.Tab
								value='recognition'
								leftSection={<IconSparkles size={16} />}
								rightSection={
									<Badge size='xs' variant='light'>
										{tabCounts.recognitionRules}
									</Badge>
								}
							>
								{t('page.tabs.recognition')}
							</Tabs.Tab>
							<Tabs.Tab
								value='badges'
								leftSection={<IconAward size={16} />}
								rightSection={
									<Badge size='xs' variant='light'>
										{tabCounts.activeBadges}
									</Badge>
								}
							>
								{t('page.tabs.badges')}
							</Tabs.Tab>
							<Tabs.Tab
								value='templates'
								leftSection={<IconTemplate size={16} />}
								rightSection={
									<Badge size='xs' variant='light'>
										{templates.length}
									</Badge>
								}
							>
								{t('page.tabs.templates')}
							</Tabs.Tab>
							<Tabs.Tab
								value='activity'
								leftSection={<IconHistory size={16} />}
								rightSection={
									<Badge size='xs' variant='light'>
										{tabCounts.sentActivity}
									</Badge>
								}
							>
								{t('page.tabs.activity')}
							</Tabs.Tab>
						</Tabs.List>

						{/* Tab Panels */}
						<Tabs.Panel value='alerts' pt='md'>
							<RulesTab
								kind='ALERT'
								onCreate={handleCreateRule}
								onEdit={handleEditRule}
								onOpenActivity={setDetailActivityEntry}
								onAcknowledgeActivity={handleAcknowledgeActivity}
								detailRuleId={detailRuleId}
								onDetailRuleHandled={handleDetailRuleHandled}
							/>
						</Tabs.Panel>

						<Tabs.Panel value='recognition' pt='md'>
							<RulesTab
								kind='RECOGNITION'
								onCreate={handleCreateRule}
								onEdit={handleEditRule}
								onOpenActivity={setDetailActivityEntry}
								onAcknowledgeActivity={handleAcknowledgeActivity}
								detailRuleId={detailRuleId}
								onDetailRuleHandled={handleDetailRuleHandled}
							/>
						</Tabs.Panel>

						<Tabs.Panel value='badges' pt='md'>
							<BadgesTab
								onOpenRule={(ruleId) => {
									const rule = rules.find((r) => r.id === ruleId);
									if (rule) {
										setTab('recognition');
										setEditorState({
											opened: false,
											mode: 'edit',
											type: rule.type,
											rule,
										});
									}
								}}
								onCreateRuleForBadge={(badge) => {
									setTab('recognition');
									setEditorState({
										opened: true,
										mode: 'create',
										type: 'BADGE_AWARD',
										rule: null,
										badgePreset: { badgeId: badge.id, conditions: badge.conditions, conditionLogic: badge.conditionLogic },
									});
								}}
							/>
						</Tabs.Panel>

						<Tabs.Panel value='templates' pt='md'>
							<TemplatesTab />
						</Tabs.Panel>

						<Tabs.Panel value='activity' pt='md'>
							<ActivityTab
								onOpenEntry={setDetailActivityEntry}
								inboxPath={inboxPath}
							/>
						</Tabs.Panel>
					</Tabs>
				</Stack>
			</ContentContainer>

			{/* Rule Type Picker Modal */}
			<RuleTypePickerModal
				opened={pickerOpened}
				onClose={() => setPickerOpened(false)}
				kinds={['ALERT', 'RECOGNITION']}
				onSelect={handlePickerSelect}
			/>

			{/* Rule Editor Drawer */}
			<RuleEditorDrawer
				opened={editorState.opened}
				mode={editorState.mode}
				type={editorState.type}
				rule={editorState.rule}
				onClose={() =>
					setEditorState({
						opened: false,
						mode: 'create',
						type: 'METRIC_ALERT',
						rule: null,
					})
				}
				onSaved={(rule) => {
					setEditorState({
						opened: false,
						mode: 'create',
						type: 'METRIC_ALERT',
						rule: null,
					});
					if (editorState.mode === 'create') {
						const kind = rule.kind === 'ALERT' ? 'alerts' : 'recognition';
						setTab(kind);
					}
				}}
				role={role}
			/>

			{/* Activity Detail Drawer */}
			<ActivityDetailDrawer
				entry={detailActivityEntry}
				opened={detailActivityEntry !== null}
				onClose={() => setDetailActivityEntry(null)}
				onAcknowledge={(entry) => {
					useTriggerRulesStore.getState().acknowledgeActivity(entry.id);
					notifySuccess(t('activity.notifications.acknowledged'));
					setDetailActivityEntry(null);
				}}
				onOpenRule={(ruleId) => {
					setDetailActivityEntry(null);
					const rule = rules.find((r) => r.id === ruleId);
					if (rule) {
						setTab(rule.kind === 'ALERT' ? 'alerts' : 'recognition');
						setDetailRuleId(ruleId);
					}
				}}
				inboxPath={inboxPath}
			/>
		</TriggersPageContext.Provider>
	);
}
