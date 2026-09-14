import React from 'react';
import { useTranslation } from 'react-i18next';
import { Divider, Stack, Text } from '@mantine/core';
import type { ReportData } from '../../buildReportData';
import ReportCover from './ReportCover';
import ReportSection from './ReportSection';
import styles from '../../Reports.module.css';

interface ReportPreviewProps {
	data: ReportData;
}

/**
 * The document itself. `id='report-preview'` is what the print stylesheet
 * keeps visible when the user generates a PDF.
 */
export const ReportPreview: React.FC<ReportPreviewProps> = ({ data }) => {
	const { t } = useTranslation('qa.reports');
	const compare = data.definition.period.compareWithPrevious;

	return (
		<div className={styles.previewScroll}>
			<div id='report-preview' className={styles.paper}>
				<Stack gap='lg'>
					<ReportCover
						definition={data.definition}
						generatedAt={data.generatedAt}
					/>

					{data.sections.length === 0 ? (
						<Text size='sm' c='dimmed'>
							{t('preview.noSections')}
						</Text>
					) : (
						data.sections.map((section, index) => (
							<React.Fragment key={section.key}>
								{index > 0 && <Divider />}
								<ReportSection section={section} compare={compare} />
							</React.Fragment>
						))
					)}
				</Stack>
			</div>
		</div>
	);
};

export default ReportPreview;
