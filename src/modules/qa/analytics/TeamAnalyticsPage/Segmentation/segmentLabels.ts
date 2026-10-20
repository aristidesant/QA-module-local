import { useTranslation } from 'react-i18next';
import { OTHER_SEGMENT_KEY } from '../../constants';
import type { GroupByDimension } from '../../types';

/** Dimensions whose segment key is a raw enum value needing a translated label. */
const KEY_LABEL_NAMESPACE: Partial<Record<GroupByDimension, string>> = {
	campaignType: 'filters.campaignTypeLabels',
	callDirection: 'filters.directionLabels',
	shift: 'filters.shiftLabels',
	tenure: 'filters.tenureLabels',
	agentType: 'filters.agentTypeLabels',
};

/** Translated label of a segment row for the current group-by ("Other (n)" for the folded tail). */
export function useSegmentLabel(groupBy: GroupByDimension) {
	const { t } = useTranslation('qa.teamAnalytics');
	return (row: { key: string; label: string; calls: number }): string => {
		if (row.key === OTHER_SEGMENT_KEY) {
			return t('segments.other', { count: row.calls });
		}
		const ns = KEY_LABEL_NAMESPACE[groupBy];
		return ns ? t(`${ns}.${row.key}`, { defaultValue: row.label }) : row.label;
	};
}
