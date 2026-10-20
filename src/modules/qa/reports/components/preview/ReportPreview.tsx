import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { ReportData } from '../../buildReportData';
import PaginatedReport from './PaginatedReport';
import { buildReportFlow } from './reportFlow';

interface ReportPreviewProps {
	data: ReportData;
}

/**
 * The document itself, as US Letter pages. `id='report-preview'` is what the print
 * stylesheet keeps visible when the user generates a PDF: every page prints, one per sheet.
 */
export const ReportPreview: React.FC<ReportPreviewProps> = ({ data }) => {
	const { t } = useTranslation('qa.reports');
	const { t: tMetrics } = useTranslation('qa.teamAnalytics');
	const compare = data.definition.period.compareWithPrevious;

	const items = useMemo(
		() =>
			buildReportFlow(data, { t, tMetrics, compare }, t('preview.noSections')),
		[data, t, tMetrics, compare]
	);

	return (
		<div id='report-preview'>
			<PaginatedReport
				items={items}
				reportName={data.definition.name || t('preview.untitled')}
			/>
		</div>
	);
};

export default ReportPreview;
