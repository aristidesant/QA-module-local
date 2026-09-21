import type { TablerIcon } from '@tabler/icons-react';
import {
	IconBook,
	IconBriefcase,
	IconClipboardCheck,
	IconClipboardList,
	IconClock,
	IconMasksTheater,
	IconMoodAngry,
	IconMoodConfuzed,
	IconMoodSad,
	IconMoodSmile,
	IconPlayerPlay,
	IconQuestionMark,
	IconSchool,
	IconShieldCheck,
} from '@tabler/icons-react';
import type {
	EvaluationArea,
	LmsAcceptanceStatus,
	LmsArea,
	LmsAssignmentStatus,
	LmsFormat,
	LmsImpactVerdict,
	LmsLevel,
	RolePlayDifficulty,
	RolePlayPersonaTrait,
} from '~/models/qa';
import type { DimensionKey } from '~/modules/qa/team/types';

export const AGENT_PERSONA = { id: 'AGT-004', name: 'John Smith' };

export const LMS_AREAS: LmsArea[] = [
	'QUALITY_ASSURANCE',
	'COMPLIANCE',
	'SENTIMENT_EMOTION',
	'BUSINESS_INSIGHTS',
	'GENERAL',
];

/**
 * Area is identity, not status — it never carried its own semantic meaning
 * (unlike a score or a state), so every area shares the same neutral color.
 * Badges tell areas apart by icon + label only; score/status colors
 * (green/yellow/red) stay reserved for actual evaluation results.
 */
export const LMS_AREA_META: Record<
	LmsArea,
	{ labelKey: string; color: string; icon: TablerIcon }
> = {
	QUALITY_ASSURANCE: {
		labelKey: 'areas.QUALITY_ASSURANCE',
		color: 'gray',
		icon: IconClipboardList,
	},
	COMPLIANCE: {
		labelKey: 'areas.COMPLIANCE',
		color: 'gray',
		icon: IconShieldCheck,
	},
	SENTIMENT_EMOTION: {
		labelKey: 'areas.SENTIMENT_EMOTION',
		color: 'gray',
		icon: IconMoodSmile,
	},
	BUSINESS_INSIGHTS: {
		labelKey: 'areas.BUSINESS_INSIGHTS',
		color: 'gray',
		icon: IconBriefcase,
	},
	GENERAL: { labelKey: 'areas.GENERAL', color: 'gray', icon: IconSchool },
};

export const LMS_FORMATS: LmsFormat[] = [
	'VIDEO',
	'DOCUMENT',
	'QUIZ',
	'SCENARIO',
];
/** Format is identity too — same neutral treatment as LMS_AREA_META above. */
export const LMS_FORMAT_META: Record<
	LmsFormat,
	{ labelKey: string; color: string; icon: TablerIcon; ctaKey: string }
> = {
	VIDEO: {
		labelKey: 'formats.VIDEO',
		color: 'gray',
		icon: IconPlayerPlay,
		ctaKey: 'cta.watch',
	},
	DOCUMENT: {
		labelKey: 'formats.DOCUMENT',
		color: 'gray',
		icon: IconBook,
		ctaKey: 'cta.read',
	},
	QUIZ: {
		labelKey: 'formats.QUIZ',
		color: 'gray',
		icon: IconClipboardCheck,
		ctaKey: 'cta.takeQuiz',
	},
	SCENARIO: {
		labelKey: 'formats.SCENARIO',
		color: 'gray',
		icon: IconMasksTheater,
		ctaKey: 'cta.practice',
	},
};

/** Persona trait is identity, not status — same neutral treatment as area/format. */
export const ROLE_PLAY_PERSONA_META: Record<
	RolePlayPersonaTrait,
	{ labelKey: string; icon: TablerIcon }
> = {
	FRUSTRATED: { labelKey: 'rolePlayPersona.FRUSTRATED', icon: IconMoodSad },
	SKEPTICAL: {
		labelKey: 'rolePlayPersona.SKEPTICAL',
		icon: IconMoodConfuzed,
	},
	CONFUSED: {
		labelKey: 'rolePlayPersona.CONFUSED',
		icon: IconQuestionMark,
	},
	RUSHED: { labelKey: 'rolePlayPersona.RUSHED', icon: IconClock },
	CALM: { labelKey: 'rolePlayPersona.CALM', icon: IconMoodSmile },
	HOSTILE: { labelKey: 'rolePlayPersona.HOSTILE', icon: IconMoodAngry },
};

/** Difficulty is a spec the agent picks, not a score — no color banding. */
export const ROLE_PLAY_DIFFICULTY_META: Record<
	RolePlayDifficulty,
	{ labelKey: string }
> = {
	EASY: { labelKey: 'rolePlayDifficulty.EASY' },
	MEDIUM: { labelKey: 'rolePlayDifficulty.MEDIUM' },
	HARD: { labelKey: 'rolePlayDifficulty.HARD' },
};

export const LMS_LEVELS: LmsLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export const ASSIGNMENT_STATUS_COLOR: Record<LmsAssignmentStatus, string> = {
	NOT_STARTED: 'gray',
	IN_PROGRESS: 'blue',
	COMPLETED: 'green',
	OVERDUE: 'red',
};

export const ACCEPTANCE_COLOR: Record<LmsAcceptanceStatus, string> = {
	NOT_REQUIRED: 'gray',
	PENDING: 'yellow',
	ACCEPTED: 'green',
	RESCHEDULE_REQUESTED: 'yellow',
	NO_RESPONSE: 'red',
};

export const VERDICT_COLOR: Record<LmsImpactVerdict, string> = {
	IMPROVED: 'green',
	SAME: 'gray',
	DECLINED: 'red',
	PENDING: 'blue',
};

/** Impact rules: 30-day windows, checkpoints at 15/30 days, ±3 band. */
export const IMPACT_WINDOW_DAYS = 30;
export const IMPACT_CHECKPOINT_DAYS = [15, 30] as const;
export const IMPACT_THRESHOLD = 3;
/** Hours the agent has to answer a mandatory assignment before it becomes NO_RESPONSE. */
export const ACCEPTANCE_SLA_HOURS = 48;

/** Sub-criterion keys → i18n label key (namespace qa.lms, `subItems.*`). Keys reuse triggers COMPLIANCE_SUB_ITEMS / EMOTION_SUB_ITEMS. */
export const SUB_ITEM_KEYS = [
	// QA aspects (from team/mockData topFailedItems)
	'openingIdentification',
	'needsAssessment',
	'objectionHandling',
	'closing',
	'mandatoryDisclosures',
	// QA error types
	'ECN',
	'ENC',
	'ECC',
	'ECUF',
	// compliance items
	'dataProtection',
	'disclosureCompliance',
	'cobranzaRegulada',
	'transparenciaConsentimiento',
	'amenazasTradicionales',
	'rrss',
	'superintendenciaBancos',
	'noLlamarList',
	// emotions
	'FRUSTRATION',
	'ANGER',
	'DISAPPOINTMENT',
	'SADNESS',
	'FEAR',
	'RAGE',
	// business signals
	'EARLY_OBJECTION',
	'UNHANDLED_OBJECTION',
	'COMPETITOR_PLUS_COST',
	'MISTARGETED_OFFER',
	'BEST_TIME_FRAME',
	// wellbeing
	'WELLBEING',
] as const;
export type SubItemKey = (typeof SUB_ITEM_KEYS)[number];

/** Sub-items offered per aspect when tagging content or a coaching session. */
export const SUB_ITEMS_BY_AREA: Record<LmsArea, SubItemKey[]> = {
	QUALITY_ASSURANCE: [
		'openingIdentification',
		'needsAssessment',
		'objectionHandling',
		'closing',
		'mandatoryDisclosures',
		'ECN',
		'ENC',
		'ECC',
		'ECUF',
	],
	COMPLIANCE: [
		'dataProtection',
		'disclosureCompliance',
		'cobranzaRegulada',
		'transparenciaConsentimiento',
		'amenazasTradicionales',
		'rrss',
		'superintendenciaBancos',
		'noLlamarList',
	],
	SENTIMENT_EMOTION: [
		'FRUSTRATION',
		'ANGER',
		'DISAPPOINTMENT',
		'SADNESS',
		'FEAR',
		'RAGE',
		'WELLBEING',
	],
	BUSINESS_INSIGHTS: [
		'EARLY_OBJECTION',
		'UNHANDLED_OBJECTION',
		'COMPETITOR_PLUS_COST',
		'MISTARGETED_OFFER',
		'BEST_TIME_FRAME',
	],
	GENERAL: [],
};

export const AREA_TO_DIMENSION: Record<EvaluationArea, DimensionKey> = {
	QUALITY_ASSURANCE: 'qa',
	COMPLIANCE: 'compliance',
	SENTIMENT_EMOTION: 'sentiment',
	BUSINESS_INSIGHTS: 'business',
};

export const DIMENSION_TO_AREA: Record<DimensionKey, EvaluationArea> = {
	qa: 'QUALITY_ASSURANCE',
	compliance: 'COMPLIANCE',
	sentiment: 'SENTIMENT_EMOTION',
	business: 'BUSINESS_INSIGHTS',
};

export type AgentLmsTab = 'assignments' | 'rolePlay' | 'history';
export const AGENT_LMS_TABS: AgentLmsTab[] = [
	'assignments',
	'rolePlay',
	'history',
];

export const AGENT_LMS_PATH = '/qa/agent/lms';
export const agentContentPath = (contentId: string) =>
	`${AGENT_LMS_PATH}/${contentId}`;
