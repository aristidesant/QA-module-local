import { formatMetric } from '~/modules/qa/analytics/helpers';
import type { ReportData, ReportSectionData } from './buildReportData';
import { slugify } from './helpers';

/** Quotes a cell only when the CSV grammar requires it. */
const cell = (value: string | number | null | undefined): string => {
	const text = value === null || value === undefined ? '' : String(value);
	return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const line = (values: (string | number | null | undefined)[]): string =>
	values.map(cell).join(',');

/** Labels come from the caller so the CSV speaks the user's language. */
export interface CsvLabels {
	sectionTitle: (section: ReportSectionData['key']) => string;
	metricLabel: (metricId: string) => string;
	column: (key: string) => string;
}

const blockFor = (section: ReportSectionData, labels: CsvLabels): string[] => {
	const rows: string[] = [`# ${labels.sectionTitle(section.key)}`];

	switch (section.key) {
		case 'overview':
			rows.push(
				line([
					labels.column('metric'),
					labels.column('current'),
					labels.column('previous'),
				])
			);
			rows.push(
				line([
					labels.metricLabel('QA_OVERALL_SCORE'),
					section.kpis.qaScore,
					section.previous.qaScore,
				])
			);
			rows.push(
				line([
					labels.metricLabel('COMPLIANCE_OVERALL_SCORE'),
					section.kpis.compliance,
					section.previous.compliance,
				])
			);
			rows.push(
				line([
					labels.metricLabel('CUSTOMER_SENTIMENT_SCORE'),
					section.kpis.customerSentiment,
					section.previous.customerSentiment,
				])
			);
			rows.push(
				line([
					labels.column('conversionRate'),
					section.kpis.conversionRate,
					section.previous.conversionRate,
				])
			);
			rows.push(
				line([
					labels.column('calls'),
					section.kpis.calls,
					section.previous.calls,
				])
			);
			break;

		case 'qa':
		case 'compliance':
		case 'sentiment':
		case 'business':
		case 'campaigns':
		case 'agents':
			rows.push(
				line([
					labels.column('segment'),
					labels.column('calls'),
					...section.metricIds.map(labels.metricLabel),
				])
			);
			for (const row of section.rows) {
				rows.push(
					line([
						row.label,
						row.calls,
						...section.metricIds.map((metricId) =>
							formatMetric(metricId, row.metrics[metricId] ?? null)
						),
					])
				);
			}
			break;

		case 'coaching':
			rows.push(
				line([
					labels.column('agent'),
					labels.column('sessions'),
					labels.column('assignments'),
					labels.column('completed'),
				])
			);
			for (const row of section.rows) {
				rows.push(
					line([row.agentName, row.sessions, row.assignments, row.completed])
				);
			}
			break;

		case 'disputes':
			rows.push(
				line([
					labels.column('id'),
					labels.column('agent'),
					labels.column('type'),
					labels.column('status'),
					labels.column('scoreBefore'),
					labels.column('scoreAfter'),
				])
			);
			for (const row of section.rows) {
				rows.push(
					line([
						row.id,
						row.agentName,
						row.evaluationType,
						row.status,
						row.scoreBefore,
						row.scoreAfter,
					])
				);
			}
			break;

		case 'burnout':
			rows.push(
				line([
					labels.column('agent'),
					labels.column('level'),
					labels.column('risk'),
				])
			);
			for (const row of section.rows) {
				rows.push(line([row.agentName, row.level, row.percentage]));
			}
			break;

		case 'rankings':
			rows.push(
				line([
					labels.column('program'),
					labels.column('status'),
					labels.column('periodCol'),
					labels.column('leader'),
					labels.column('winner'),
				])
			);
			for (const row of section.rows) {
				rows.push(
					line([row.name, row.status, row.period, row.leader, row.winner])
				);
			}
			break;
	}

	return rows;
};

/** One block per section, separated by a blank line. */
export const toCsv = (data: ReportData, labels: CsvLabels): string =>
	data.sections
		.map((section) => blockFor(section, labels).join('\r\n'))
		.join('\r\n\r\n');

export const csvFilename = (data: ReportData): string =>
	`${slugify(data.definition.name)}-${data.definition.period.from}-${data.definition.period.to}.csv`;

/** Rough byte size of the generated file, for the Generated tab. */
export const approximateSizeKb = (content: string): number =>
	Math.max(1, Math.round(new Blob([content]).size / 1024));
