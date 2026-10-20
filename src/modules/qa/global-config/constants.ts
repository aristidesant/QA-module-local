import type { TablerIcon } from '@tabler/icons-react';
import {
	IconBook2,
	IconBuildingStore,
	IconClipboardCheck,
	IconFileDescription,
	IconMoodSearch,
	IconRuler2,
	IconWaveSine,
} from '@tabler/icons-react';
import type {
	CallAnalysisKind,
	DateTimeFormat,
	GlobalConfigTab,
	NamingSeparator,
	NamingToken,
	RuleAgentType,
	RuleScope,
	ScaleType,
	SentimentLevel,
} from './types';

export const GLOBAL_CONFIG_TABS: { key: GlobalConfigTab; icon: TablerIcon }[] =
	[
		{ key: 'callAnalysis', icon: IconWaveSine },
		{ key: 'evaluation', icon: IconClipboardCheck },
		{ key: 'contextRules', icon: IconBook2 },
		{ key: 'campaignTypes', icon: IconBuildingStore },
		{ key: 'namingConvention', icon: IconFileDescription },
		{ key: 'scoreScales', icon: IconRuler2 },
		{ key: 'sentiment', icon: IconMoodSearch },
	];

export const DEFAULT_TAB: GlobalConfigTab = 'callAnalysis';

export const NAMING_TOKENS: NamingToken[] = [
	'source-campaign-id',
	'date-time',
	'source-agent-id',
	'dialed-number',
	'direction',
	'customer-name',
	'customer-id',
];
export const NAMING_SEPARATORS: NamingSeparator[] = ['_', '-', '.'];
export const DATE_TIME_FORMATS: DateTimeFormat[] = [
	'YYYYMMDD-HHmmss',
	'YYYYMMDDHHmmss',
	'YYYY-MM-DD_HH-mm-ss',
];

export const SCALE_TYPES: ScaleType[] = [
	'QA',
	'COMPLIANCE',
	'SENTIMENT',
	'BUSINESS',
	'COACHING',
];

/** Display order, most positive first (matches the catalogue summary chips). */
export const SENTIMENT_LEVELS: SentimentLevel[] = [
	'VERY_POSITIVE',
	'POSITIVE',
	'NEUTRAL',
	'NEGATIVE',
	'VERY_NEGATIVE',
];

export const RULE_SCOPES: RuleScope[] = ['CLIENT', 'CAMPAIGN_TYPE', 'CAMPAIGN'];
export const RULE_AGENT_TYPES: RuleAgentType[] = ['ALL', 'HUMAN', 'AI'];

export const CALL_ANALYSIS_KINDS: CallAnalysisKind[] = [
	'QA',
	'COMPLIANCE',
	'SENTIMENT',
	'BUSINESS',
];
export const PII_FIELDS = ['phone', 'card', 'nationalId', 'email'] as const;
export const AUDIO_RETENTION_DAYS = [30, 90, 180, 365] as const;

export const PROMPT_MAX = 20000;

/** The mock "active client" every tab refers to. */
export const ACTIVE_CLIENT_NAME = 'Newtech';
