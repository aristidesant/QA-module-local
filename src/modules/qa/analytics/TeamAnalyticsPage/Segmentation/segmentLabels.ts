import { useTranslation } from 'react-i18next';
import type { SentimentCauseSegmentKey } from '~/modules/qa/sentimentCauses/types';
import { useCauseLabel } from '~/modules/qa/sentimentCauses/useCauseSettings';
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
	const causeLabel = useCauseLabel();
	return (row: { key: string; label: string; calls: number }): string => {
		if (row.key === OTHER_SEGMENT_KEY) {
			return t('segments.other', { count: row.calls });
		}
		// Cause names can be renamed in Settings, so they do not come from a locale prefix.
		if (groupBy === 'sentimentCause')
			return causeLabel(row.key as SentimentCauseSegmentKey);
		const ns = KEY_LABEL_NAMESPACE[groupBy];
		return ns ? t(`${ns}.${row.key}`, { defaultValue: row.label }) : row.label;
	};
}
