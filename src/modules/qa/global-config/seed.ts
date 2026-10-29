import { DEFAULT_SENTIMENT_CAUSE_CATALOGUE } from '~/modules/qa/sentimentCauses/constants';
import { DEFAULT_SETTINGS } from '~/modules/qa/settings/constants';
import {
	EMOTION_SENTIMENT_MAP,
	type Emotion,
	type SentimentCategory,
} from '~/modules/qa/emotion-sentiment/types';
import type {
	CallAnalysisConfig,
	CampaignRef,
	CampaignTypeEntry,
	ContextRule,
	EmotionEntry,
	EvaluationConfig,
	EvaluationVersion,
	EvaluatorOption,
	NamingConvention,
	ProtocolDocument,
	ScoreScale,
	SentimentAnalyzerConfig,
	SentimentLevel,
} from './types';

const day = (daysAgo: number, hour = 10) =>
	new Date(Date.UTC(2026, 9, 20 - daysAgo, hour, 0, 0)).toISOString();

export const SEED_CALL_ANALYSIS: CallAnalysisConfig = {
	language: 'AUTO',
	diarization: true,
	analyses: ['QA', 'COMPLIANCE', 'SENTIMENT', 'BUSINESS'],
	minDurationSeconds: 30,
	audioRetentionDays: 90,
	updatedAt: day(6),
};

export const SEED_EVALUATORS: EvaluatorOption[] = [
	{ id: 'ev-primary', name: 'Luna', code: 'R8_1E1F27B67ED3_PRIMARY' },
	{
		id: 'ev-fallback',
		name: 'Luna Respaldo',
		code: 'R8_1E1F27B67ED3_FALLBACK',
	},
	{ id: 'ev-nova', name: 'Nova', code: 'R8_77A0C1D2E3F4_PRIMARY' },
];

export const SEED_EVALUATION: EvaluationConfig = {
	version: 33,
	format: 'COPC',
	defaultFormId: 'frm-001',
	primaryEvaluatorId: 'ev-primary',
	fallbackEvaluatorId: 'ev-fallback',
	updatedAt: day(2),
};

export const SEED_EVALUATION_VERSIONS: EvaluationVersion[] = [
	{
		version: 33,
		savedAt: day(2),
		savedBy: 'Super admin',
		summary: 'Fallback evaluator set to Luna Respaldo',
	},
	{
		version: 32,
		savedAt: day(9),
		savedBy: 'Super admin',
		summary: 'Default form switched to COPC Sales Calls',
	},
	{
		version: 31,
		savedAt: day(21),
		savedBy: 'QA Manager',
		summary: 'Evaluation format changed to COPC',
	},
	{
		version: 30,
		savedAt: day(40),
		savedBy: 'Super admin',
		summary: 'Primary evaluator set to Luna',
	},
];

export const SEED_CAMPAIGNS: CampaignRef[] = [
	{ id: 'cmp-1', name: 'Cobros Q4', campaignType: 'COBROS' },
	{ id: 'cmp-2', name: 'Localización Norte', campaignType: 'LOCALIZACION' },
	{ id: 'cmp-3', name: 'Ventas Tarjeta Oro', campaignType: 'SALES' },
	{ id: 'cmp-4', name: 'Activación Octubre', campaignType: 'CARD_ACTIVATION' },
	{
		id: 'cmp-5',
		name: 'Retención Premium',
		campaignType: 'CANCELLATION_ATTEMPT',
	},
];

export const SEED_CONTEXT_RULES: ContextRule[] = [
	{
		id: 'rule-1',
		topic: 'glosario.polaridad-si-no',
		scope: 'CLIENT',
		target: 'ALL',
		agentType: 'ALL',
		context:
			'POLARIDAD SI/NO DE ÍTEMS NEGATIVOS: cuando una pregunta del formulario está redactada en negativo, "Sí" significa que el error ocurrió.',
		status: 'ACTIVE',
		updatedAt: day(30),
	},
	{
		id: 'rule-2',
		topic: 'copc-cobros.principios',
		scope: 'CAMPAIGN_TYPE',
		target: 'COBROS',
		agentType: 'ALL',
		context:
			'ALCANCE: Cobros, cliente Newtech. El agente debe identificar la deuda, ofrecer un plan y confirmar la fecha de pago antes de cerrar.',
		status: 'ACTIVE',
		updatedAt: day(12),
	},
	{
		id: 'rule-3',
		topic: 'glosario.polaridad-si-no',
		scope: 'CAMPAIGN_TYPE',
		target: 'COBROS',
		agentType: 'ALL',
		context:
			'POLARIDAD COPC EN LA LÍNEA COBROS: los ítems ECC se evalúan como errores críticos aunque el agente corrija al final de la llamada.',
		status: 'ACTIVE',
		updatedAt: day(12),
	},
	{
		id: 'rule-4',
		topic: 'linea-localizacion.callback',
		scope: 'CAMPAIGN_TYPE',
		target: 'LOCALIZACION',
		agentType: 'ALL',
		context:
			'CALLBACK EN LA LÍNEA LOCALIZACIÓN: si el titular no contesta, el agente debe dejar un mensaje con la referencia y programar una nueva llamada.',
		status: 'ACTIVE',
		updatedAt: day(14),
	},
	{
		id: 'rule-5',
		topic: 'ventas.oferta-principal',
		scope: 'CAMPAIGN_TYPE',
		target: 'SALES',
		agentType: 'HUMAN',
		context:
			'OFERTA PRINCIPAL: toda llamada de ventas debe presentar la tarjeta Oro antes de cualquier producto alternativo.',
		status: 'ACTIVE',
		updatedAt: day(18),
	},
	{
		id: 'rule-6',
		topic: 'activacion.verificacion',
		scope: 'CAMPAIGN_TYPE',
		target: 'CARD_ACTIVATION',
		agentType: 'ALL',
		context:
			'VERIFICACIÓN DE IDENTIDAD: antes de activar, el agente confirma los últimos cuatro dígitos y la fecha de nacimiento del titular.',
		status: 'ACTIVE',
		updatedAt: day(25),
	},
	{
		id: 'rule-7',
		topic: 'retencion.objeciones',
		scope: 'CAMPAIGN_TYPE',
		target: 'CANCELLATION_ATTEMPT',
		agentType: 'ALL',
		context:
			'MANEJO DE OBJECIONES: escuchar el motivo de cancelación completo antes de presentar la contraoferta.',
		status: 'INACTIVE',
		updatedAt: day(33),
	},
	{
		id: 'rule-8',
		topic: 'ia.tono',
		scope: 'CAMPAIGN_TYPE',
		target: 'SALES',
		agentType: 'AI',
		context:
			'TONO DEL AGENTE IA: mantener un registro formal y evitar expresiones coloquiales en la línea de ventas.',
		status: 'ACTIVE',
		updatedAt: day(5),
	},
	{
		id: 'rule-9',
		topic: 'copc-cobros.principios',
		scope: 'CAMPAIGN',
		target: 'Cobros Q4',
		agentType: 'ALL',
		context:
			'COBROS Q4: durante octubre se permite ofrecer el descuento por pronto pago del 15% en deudas mayores a 90 días.',
		status: 'ACTIVE',
		updatedAt: day(3),
	},
	{
		id: 'rule-10',
		topic: 'linea-localizacion.callback',
		scope: 'CAMPAIGN',
		target: 'Localización Norte',
		agentType: 'ALL',
		context:
			'LOCALIZACIÓN NORTE: los callbacks se programan solo en horario de 9:00 a 17:00 hora local de la zona norte.',
		status: 'ACTIVE',
		updatedAt: day(4),
	},
	{
		id: 'rule-11',
		topic: 'ventas.oferta-principal',
		scope: 'CAMPAIGN',
		target: 'Ventas Tarjeta Oro',
		agentType: 'ALL',
		context:
			'TARJETA ORO: la oferta vigente incluye anualidad gratuita el primer año; mencionarla antes de cerrar.',
		status: 'ACTIVE',
		updatedAt: day(7),
	},
	{
		id: 'rule-12',
		topic: 'activacion.verificacion',
		scope: 'CAMPAIGN',
		target: 'Activación Octubre',
		agentType: 'ALL',
		context:
			'ACTIVACIÓN OCTUBRE: además de la verificación estándar, confirmar el código enviado por SMS.',
		status: 'INACTIVE',
		updatedAt: day(8),
	},
	{
		id: 'rule-13',
		topic: 'retencion.objeciones',
		scope: 'CAMPAIGN',
		target: 'Retención Premium',
		agentType: 'ALL',
		context:
			'RETENCIÓN PREMIUM: el agente puede ofrecer hasta dos meses sin costo como contraoferta final.',
		status: 'ACTIVE',
		updatedAt: day(1),
	},
];

export const SEED_PROTOCOL_DOCUMENTS: ProtocolDocument[] = [
	{
		id: 'doc-1',
		name: 'Protocolo Cobros.docx',
		lineOfBusiness: 'COBROS',
		version: 3,
		uploadedAt: day(11),
	},
	{
		id: 'doc-2',
		name: 'Protocolo Localización.docx',
		lineOfBusiness: 'LOCALIZACION',
		version: 2,
		uploadedAt: day(19),
	},
	{
		id: 'doc-3',
		name: 'Protocolo Ventas.docx',
		lineOfBusiness: 'SALES',
		version: 1,
		uploadedAt: day(45),
	},
];

export const SEED_CAMPAIGN_TYPES: CampaignTypeEntry[] = [
	{
		code: 'ALL',
		name: 'All',
		description: null,
		status: 'ACTIVE',
		locked: true,
		updatedAt: day(120),
	},
	{
		code: 'CANCELLATION_ATTEMPT',
		name: 'Cancellation attempt',
		description: null,
		status: 'ACTIVE',
		updatedAt: day(60),
	},
	{
		code: 'CARD_ACTIVATION',
		name: 'Card activation',
		description: null,
		status: 'ACTIVE',
		updatedAt: day(58),
	},
	{
		code: 'COBROS',
		name: 'Collections',
		description: null,
		status: 'ACTIVE',
		updatedAt: day(55),
	},
	{
		code: 'LOCALIZACION',
		name: 'Localization',
		description:
			'Localization line: outbound calls handled by the tracing team to reach account holders.',
		status: 'ACTIVE',
		updatedAt: day(20),
	},
	{
		code: 'SALES',
		name: 'Sales',
		description: null,
		status: 'ACTIVE',
		updatedAt: day(50),
	},
];

export const SEED_NAMING_CONVENTION: NamingConvention = {
	separator: '_',
	tokens: [
		'source-campaign-id',
		'date-time',
		'source-agent-id',
		'dialed-number',
		'direction',
		'customer-name',
		'customer-id',
	],
	dateTimeFormat: 'YYYYMMDD-HHmmss',
	sampleFilename:
		'P710_20260721-083002_wmendez_8098583149_CE_Maria-Perez_customer-123.mp3',
	updatedAt: day(15),
};

const { qa, compliance, business, coaching } = DEFAULT_SETTINGS.thresholds;

export const SEED_SCORE_SCALES: ScoreScale[] = [
	{
		id: 'scale-qa',
		name: 'QA score',
		type: 'QA',
		bands: [
			{ label: 'At risk', min: 0 },
			{ label: 'Watch', min: qa.scoreBands.watch },
			{ label: 'On target', min: qa.scoreBands.onTarget },
		],
		updatedAt: day(2),
	},
	{
		id: 'scale-compliance',
		name: 'Compliance',
		type: 'COMPLIANCE',
		bands: [
			{ label: 'Violation', min: 0 },
			{ label: 'Warning', min: compliance.bands.watch },
			{ label: 'Compliant', min: compliance.bands.onTarget },
		],
		updatedAt: day(9),
	},
	{
		id: 'scale-conversion',
		name: 'Conversion rate',
		type: 'BUSINESS',
		bands: [
			{ label: 'Low', min: 0 },
			{ label: 'Watch', min: business.bands.watch },
			{ label: 'On target', min: business.bands.onTarget },
		],
		updatedAt: day(16),
	},
	{
		id: 'scale-coaching',
		name: 'Coaching tiers',
		type: 'COACHING',
		bands: [
			{ label: 'Critical', min: 0 },
			{ label: 'Needs improvement', min: coaching.tierCuts.needsImprovement },
			{ label: 'Good', min: coaching.tierCuts.good },
			{ label: 'Excellent', min: coaching.tierCuts.excellent },
		],
		updatedAt: day(27),
	},
];

const LEVEL_BY_CATEGORY: Record<SentimentCategory, SentimentLevel> = {
	'very-positive': 'VERY_POSITIVE',
	positive: 'POSITIVE',
	neutral: 'NEUTRAL',
	negative: 'NEGATIVE',
	'very-negative': 'VERY_NEGATIVE',
};

const EMOTION_DESCRIPTIONS: Record<Emotion, string> = {
	ELATION: 'Intense delight, exuberance, or unusually elevated happiness.',
	GRATITUDE: 'Strong or effusive appreciation and thanks.',
	JOY: 'Clear happiness, pleasure, or positive enthusiasm without extreme intensity.',
	RELIEF: 'Positive release after worry, difficulty, or uncertainty has eased.',
	SATISFACTION: 'Contentment or approval that needs or expectations were met.',
	NEUTRAL: 'Calm, ordinary, factual, or without a clear emotional signal.',
	SURPRISE: 'Unexpected realization, astonishment, or disbelief.',
	FRUSTRATION: 'Irritation at an obstacle, delay, or unmet expectation.',
	SADNESS: 'Low mood, disappointment with loss, or discouragement.',
	FEAR: 'Worry or anxiety about a risk, consequence, or uncertainty.',
	DISAPPOINTMENT: 'Letdown after an outcome fell short of what was expected.',
	ANGER:
		'Clear hostility or strong displeasure directed at the situation or the other party.',
	RAGE: 'Extreme, escalated anger with loss of composure.',
};

const EMOTION_ORDER: Emotion[] = [
	'ELATION',
	'GRATITUDE',
	'JOY',
	'RELIEF',
	'SATISFACTION',
	'NEUTRAL',
	'SURPRISE',
	'FRUSTRATION',
	'SADNESS',
	'FEAR',
	'DISAPPOINTMENT',
	'ANGER',
	'RAGE',
];

export const SEED_EMOTIONS: EmotionEntry[] = EMOTION_ORDER.map((emotion) => ({
	label: emotion,
	description: EMOTION_DESCRIPTIONS[emotion],
	level: LEVEL_BY_CATEGORY[EMOTION_SENTIMENT_MAP[emotion]],
}));

export const SEED_SENTIMENT_ANALYZER: SentimentAnalyzerConfig = {
	version: 7,
	systemPrompt:
		'Classify the single dominant textual emotion expressed by each participant in a role-tagged contact-center transcript. Use only the configured emotion labels and supplied participant roles. Do not infer or swap roles. Return only valid JSON matching the requested contract.',
	classificationInstructions:
		"Classify the AGENT and CUSTOMER independently while considering the full chronological conversation. Select exactly one dominant textual emotion for each participant. Use the most specific configured definition supported by the participant's language and conversational context. Prefer NEUTRAL when no emotion is clearly expressed. Treat SURPRISE as neutral unless the language supports a stronger positive or negative emotion.",
	emotions: SEED_EMOTIONS,
	causes: DEFAULT_SENTIMENT_CAUSE_CATALOGUE,
	updatedAt: day(13),
};
