import {
	IconCalendarOff,
	IconClipboardList,
	IconHandStop,
	IconHeartOff,
	IconHourglass,
	IconInfoTriangle,
	IconPlugConnectedX,
	IconReceipt,
	IconTag,
	IconVolume,
} from '@tabler/icons-react';
import { isCustomCauseKey } from '../constants';
import type { AnyCauseKey, SentimentCauseKey } from '../types';

export const CAUSE_ICONS: Record<SentimentCauseKey, typeof IconHourglass> = {
	WAIT_TIME: IconHourglass,
	PRICING_BILLING: IconReceipt,
	TECHNICAL_FAILURE: IconPlugConnectedX,
	PROCESS_POLICY: IconClipboardList,
	BROKEN_PROMISE: IconCalendarOff,
	AGENT_TONE: IconVolume,
	LACK_OF_EMPATHY: IconHeartOff,
	INTERRUPTIONS: IconHandStop,
	WRONG_INFORMATION: IconInfoTriangle,
};

/** Icon of any cause; the ones added in Settings share a generic tag. */
export const causeIcon = (key: AnyCauseKey): typeof IconHourglass =>
	isCustomCauseKey(key) ? IconTag : CAUSE_ICONS[key];
