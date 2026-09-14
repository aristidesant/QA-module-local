import React from 'react';
import { useTranslation } from 'react-i18next';
import { SimpleGrid } from '@mantine/core';
import {
	IconCalendarEvent,
	IconClock,
	IconFileDownload,
	IconFiles,
} from '@tabler/icons-react';
import { StatCard } from '~/components/StatCard';
import type {
	GeneratedReportRecord,
	ReportDefinition,
} from '~/models/qa/reportBuilder';
import { NOW_ISO } from '~/modules/qa/team/constants';
import { fromMockNow } from '../helpers';

interface ReportsKpiStripProps {
	definitions: ReportDefinition[];
	generated: GeneratedReportRecord[];
}

/** Saved reports, this month's generations, live schedules and recency. */
export const ReportsKpiStrip: React.FC<ReportsKpiStripProps> = ({
	definitions,
	generated,
}) => {
	const { t } = useTranslation('qa.reports');

	const month = NOW_ISO.slice(0, 7);
	const generatedThisMonth = generated.filter((record) =>
		record.generatedAt.startsWith(month)
	).length;
	const activeSchedules = definitions.filter(
		(definition) => definition.schedule?.enabled
	).length;
	const last = generated[0];

	return (
		<SimpleGrid cols={{ base: 2, md: 4 }} spacing='md'>
			<StatCard
				title={t('kpis.saved')}
				value={definitions.length}
				icon={<IconFiles size={18} />}
				color='blue'
			/>
			<StatCard
				title={t('kpis.generatedMonth')}
				value={generatedThisMonth}
				icon={<IconFileDownload size={18} />}
				color='teal'
			/>
			<StatCard
				title={t('kpis.schedules')}
				value={activeSchedules}
				icon={<IconCalendarEvent size={18} />}
				color='grape'
			/>
			<StatCard
				title={t('kpis.lastGenerated')}
				value={last ? fromMockNow(last.generatedAt) : t('kpis.never')}
				subtitle={last?.definitionName}
				icon={<IconClock size={18} />}
				color='orange'
			/>
		</SimpleGrid>
	);
};

export default ReportsKpiStrip;
