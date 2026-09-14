import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useSearchParams } from 'react-router';
import { Badge, Button, Group, Stack, Tabs, Text, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import type {
	GeneratedReportRecord,
	ReportDefinition,
	ReportDraft,
} from '~/models/qa/reportBuilder';
import { downloadBlob } from '~/utils/fileUtils';
import { roleFromPath } from '~/modules/qa/team/helpers';
import { notifySuccess, notifyWarning } from '~/modules/qa/utils/notifications';
import {
	useReportsStore,
	selectDefinitions,
	selectGenerated,
} from '~/stores/qa/reportsStore';
import { REPORT_TABS, defaultDraft, type ReportTab } from '../constants';
import { definitionsForRole } from '../helpers';
import BuilderTab from '../tabs/BuilderTab';
import SavedTab from '../tabs/SavedTab';
import GeneratedTab from '../tabs/GeneratedTab';
import SchedulesTab from '../tabs/SchedulesTab';
import ReportsKpiStrip from './ReportsKpiStrip';

const TAB_PARAM = 'tab';

/** Reports for a supervisor (own team) or the QA Manager (everyone). */
export const ReportsPage: React.FC = () => {
	const { t } = useTranslation('qa.reports');
	const location = useLocation();
	const role = roleFromPath(location.pathname);
	const [searchParams, setSearchParams] = useSearchParams();

	const allDefinitions = useReportsStore(selectDefinitions);
	const generated = useReportsStore(selectGenerated);
	const deleteDefinition = useReportsStore((s) => s.deleteDefinition);
	const duplicateDefinition = useReportsStore((s) => s.duplicateDefinition);
	const toggleSchedule = useReportsStore((s) => s.toggleSchedule);
	const runScheduleNow = useReportsStore((s) => s.runScheduleNow);

	const [draft, setDraft] = useState<ReportDraft>(() => defaultDraft(role));
	/** Id of the saved definition the builder is editing, if any. */
	const [editingId, setEditingId] = useState<string | null>(null);

	const definitions = useMemo(
		() => definitionsForRole(allDefinitions, role),
		[allDefinitions, role]
	);
	const scheduled = useMemo(
		() => definitions.filter((definition) => definition.schedule !== null),
		[definitions]
	);

	const paramTab = searchParams.get(TAB_PARAM) as ReportTab | null;
	const tab: ReportTab =
		paramTab && REPORT_TABS.includes(paramTab) ? paramTab : 'builder';

	const goToTab = useCallback(
		(next: ReportTab) => {
			const params = new URLSearchParams(searchParams);
			params.set(TAB_PARAM, next);
			setSearchParams(params, { replace: true });
		},
		[searchParams, setSearchParams]
	);

	const startNew = useCallback(() => {
		setDraft(defaultDraft(role));
		setEditingId(null);
		goToTab('builder');
	}, [role, goToTab]);

	const loadIntoBuilder = useCallback(
		(definition: ReportDefinition) => {
			const { id, createdAt, updatedAt, lastGeneratedAt, builtIn, ...rest } =
				definition;
			setDraft(rest);
			// Built-ins are templates: editing one starts a new definition.
			setEditingId(builtIn ? null : id);
			goToTab('builder');
		},
		[goToTab]
	);

	const handleDuplicate = useCallback(
		(definition: ReportDefinition) => {
			const copy = duplicateDefinition(definition.id);
			if (copy) notifySuccess(t('builder.saved'));
		},
		[duplicateDefinition, t]
	);

	const handleDelete = useCallback(
		(definition: ReportDefinition) => {
			if (definition.builtIn) {
				notifyWarning(t('saved.builtIn'));
				return;
			}
			deleteDefinition(definition.id);
			if (editingId === definition.id) startNew();
		},
		[deleteDefinition, editingId, startNew, t]
	);

	const handleRunNow = useCallback(
		(definition: ReportDefinition) => {
			runScheduleNow(definition.id);
			notifySuccess(t('schedules.ran'));
			goToTab('generated');
		},
		[runScheduleNow, goToTab, t]
	);

	/** CSV rows keep their text so they can be downloaded again. */
	const handleDownload = useCallback(
		(record: GeneratedReportRecord) => {
			if (record.format === 'CSV' && record.csv) {
				downloadBlob(
					new Blob([record.csv], { type: 'text/csv;charset=utf-8' }),
					`${record.definitionName}.csv`
				);
				notifySuccess(t('generated.csvReady'));
				return;
			}
			if (record.format === 'PDF') {
				window.print();
				return;
			}
			notifySuccess(t('generated.mockXlsx'));
		},
		[t]
	);

	const counts: Record<ReportTab, number | null> = {
		builder: null,
		saved: definitions.length,
		generated: generated.length,
		schedules: scheduled.length,
	};

	return (
		<ContentContainer contentWidth='full'>
			<Stack gap='lg'>
				<Group justify='space-between' align='flex-start' wrap='wrap'>
					<div>
						<Text size='xs' c='dimmed' tt='uppercase' fw={600}>
							{t(`page.eyebrow.${role}`)}
						</Text>
						<Title order={1}>{t('page.title')}</Title>
						<Text c='dimmed' mt={4}>
							{t('page.description')}
						</Text>
					</div>
					<Button leftSection={<IconPlus size={16} />} onClick={startNew}>
						{t('page.new')}
					</Button>
				</Group>

				<ReportsKpiStrip definitions={definitions} generated={generated} />

				<Tabs
					value={tab}
					onChange={(value) => goToTab(value as ReportTab)}
					keepMounted={false}
				>
					<Tabs.List>
						{REPORT_TABS.map((key) => (
							<Tabs.Tab
								key={key}
								value={key}
								rightSection={
									counts[key] !== null ? (
										<Badge size='sm' variant='light' circle>
											{counts[key]}
										</Badge>
									) : undefined
								}
							>
								{t(`tabs.${key}`)}
							</Tabs.Tab>
						))}
					</Tabs.List>

					<Tabs.Panel value='builder' pt='lg'>
						<BuilderTab
							role={role}
							draft={draft}
							editingId={editingId}
							onDraftChange={setDraft}
							onSaved={(definition) => setEditingId(definition.id)}
							onReset={startNew}
						/>
					</Tabs.Panel>

					<Tabs.Panel value='saved' pt='lg'>
						<SectionCard
							title={t('tabs.saved')}
							description={t('page.description')}
						>
							<SavedTab
								definitions={definitions}
								onLoad={loadIntoBuilder}
								onDuplicate={handleDuplicate}
								onDelete={handleDelete}
							/>
						</SectionCard>
					</Tabs.Panel>

					<Tabs.Panel value='generated' pt='lg'>
						<SectionCard title={t('tabs.generated')}>
							<GeneratedTab generated={generated} onDownload={handleDownload} />
						</SectionCard>
					</Tabs.Panel>

					<Tabs.Panel value='schedules' pt='lg'>
						<SectionCard title={t('tabs.schedules')}>
							<SchedulesTab
								definitions={scheduled}
								onToggle={(definition) => toggleSchedule(definition.id)}
								onRunNow={handleRunNow}
							/>
						</SectionCard>
					</Tabs.Panel>
				</Tabs>
			</Stack>
		</ContentContainer>
	);
};

export default ReportsPage;
