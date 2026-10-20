import { Text } from '@mantine/core';
import type { ReportData } from '../../buildReportData';
import type { FlowItem } from './pagination';
import ReportCover from './ReportCover';
import { sectionFlowItems, type FlowContext } from './ReportSection';

/** The whole report as flow items: the cover, then every section in order. */
export function buildReportFlow(
	data: ReportData,
	ctx: FlowContext,
	noSectionsText: string
): FlowItem[] {
	const items: FlowItem[] = [
		{
			kind: 'block',
			id: 'cover',
			node: (
				<ReportCover
					definition={data.definition}
					generatedAt={data.generatedAt}
				/>
			),
		},
	];

	if (data.sections.length === 0) {
		items.push({
			kind: 'block',
			id: 'no-sections',
			node: (
				<Text size='sm' c='dimmed'>
					{noSectionsText}
				</Text>
			),
		});
		return items;
	}

	for (const section of data.sections) {
		items.push(...sectionFlowItems(section, ctx));
	}
	return items;
}
