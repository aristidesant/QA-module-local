import type { TablerIcon } from '@tabler/icons-react';
import { IconAddressBook, IconClipboardText, IconHistory, IconMoodSmile, IconPhone, IconTag } from '@tabler/icons-react';
import type { ChurnRisk, ContactChannel, ContactOutcome, CustomerEventType, CustomerSegment, CustomerStatus, DayPart, OfferResult, ReceptivenessBand, Weekday } from './types';

export const NOW_ISO = '2026-09-12T15:00:00Z';

export type CustomerTab = 'overview' | 'contacts' | 'sentiment' | 'offers' | 'surveys' | 'timeline';
export const CUSTOMER_TABS: { value: CustomerTab; labelKey: string; icon: TablerIcon }[] = [
	{ value: 'overview', labelKey: 'tabs.overview', icon: IconAddressBook },
	{ value: 'contacts', labelKey: 'tabs.contacts', icon: IconPhone },
	{ value: 'sentiment', labelKey: 'tabs.sentiment', icon: IconMoodSmile },
	{ value: 'offers', labelKey: 'tabs.offers', icon: IconTag },
	{ value: 'surveys', labelKey: 'tabs.surveys', icon: IconClipboardText },
	{ value: 'timeline', labelKey: 'tabs.timeline', icon: IconHistory },
];

export const SEGMENT_META: Record<CustomerSegment, { labelKey: string; color: string }> = {
	residential: { labelKey: 'segment.residential', color: 'blue' },
	business: { labelKey: 'segment.business', color: 'grape' },
	premium: { labelKey: 'segment.premium', color: 'yellow' },
};
export const STATUS_META: Record<CustomerStatus, { labelKey: string; color: string }> = {
	active: { labelKey: 'status.active', color: 'green' }, prospect: { labelKey: 'status.prospect', color: 'blue' }, churned: { labelKey: 'status.churned', color: 'gray' },
};
export const CHANNEL_META: Record<ContactChannel, { labelKey: string }> = {
	phone: { labelKey: 'channel.phone' }, whatsapp: { labelKey: 'channel.whatsapp' }, email: { labelKey: 'channel.email' }, sms: { labelKey: 'channel.sms' },
};
export const OUTCOME_META: Record<ContactOutcome, { labelKey: string; color: string }> = {
	answered: { labelKey: 'outcome.answered', color: 'green' }, 'no-answer': { labelKey: 'outcome.noAnswer', color: 'gray' },
	voicemail: { labelKey: 'outcome.voicemail', color: 'gray' }, busy: { labelKey: 'outcome.busy', color: 'orange' }, callback: { labelKey: 'outcome.callback', color: 'blue' },
};
export const OFFER_RESULT_META: Record<OfferResult, { labelKey: string; color: string }> = {
	accepted: { labelKey: 'offerResult.accepted', color: 'green' }, rejected: { labelKey: 'offerResult.rejected', color: 'red' }, deferred: { labelKey: 'offerResult.deferred', color: 'yellow' },
};
export const RECEPTIVENESS_META: Record<ReceptivenessBand, { labelKey: string; color: string; min: number }> = {
	receptive: { labelKey: 'receptiveness.receptive', color: 'green', min: 60 },
	neutral: { labelKey: 'receptiveness.neutral', color: 'yellow', min: 35 },
	resistant: { labelKey: 'receptiveness.resistant', color: 'red', min: 0 },
};
export const CHURN_META: Record<ChurnRisk, { labelKey: string; color: string }> = {
	low: { labelKey: 'churn.low', color: 'green' }, medium: { labelKey: 'churn.medium', color: 'yellow' }, high: { labelKey: 'churn.high', color: 'red' },
};
export const EVENT_META: Record<CustomerEventType, { labelKey: string; color: string }> = {
	contact: { labelKey: 'timeline.types.contact', color: 'blue' }, offer: { labelKey: 'timeline.types.offer', color: 'grape' },
	survey: { labelKey: 'timeline.types.survey', color: 'teal' }, note: { labelKey: 'timeline.types.note', color: 'indigo' },
	followUp: { labelKey: 'timeline.types.followUp', color: 'orange' }, flag: { labelKey: 'timeline.types.flag', color: 'red' },
};

export const WEEKDAYS: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_PARTS: DayPart[] = ['morning', 'afternoon', 'evening'];
export const DAY_PART_HOURS: Record<DayPart, string> = { morning: '08:00–12:00', afternoon: '12:00–17:00', evening: '17:00–21:00' };

export const OFFER_CATALOG = [
	{ name: 'Premium Fiber 500 Mbps + TV bundle', price: 49.99 },
	{ name: 'Fiber 300 Mbps', price: 34.99 },
	{ name: 'Mobile + Home bundle', price: 59.99 },
	{ name: 'Streaming add-on', price: 9.99 },
	{ name: 'Loyalty discount 12 months', price: 29.99 },
];
export const COMPETITORS = ['Claro', 'Tigo', 'Altice'];
export const OBJECTION_PHRASES = [
	'Not looking to spend more right now', 'Need to check with my partner', 'Competitor offers the same for less',
	'Unsure what it costs after the promo', 'Happy with the current plan', 'Installation would take too long',
];
export const FOLLOW_UP_REASONS = ['Contract renewal', 'Promo follow-up', 'Complaint check-in', 'Survey callback', 'Upgrade proposal'];
