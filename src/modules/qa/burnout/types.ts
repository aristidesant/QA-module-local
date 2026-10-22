/** The families of voice and speech signals that point to burnout. */
export type VoiceFamily = 'acoustic' | 'tempo' | 'lexical' | 'cognitive';

/** The three dimensions of burnout (Maslach): every signal speaks to one of them. */
export type BurnoutDimension = 'exhaustion' | 'cynicism' | 'efficacy';

export type VoiceSignalKey =
	// Acoustic, from the audio
	| 'pitchVariability'
	| 'vocalEnergy'
	| 'breathiness'
	| 'sighs'
	// Tempo
	| 'speechRate'
	| 'longPauses'
	| 'responseLatency'
	| 'fillers'
	// Lexical, from the transcript
	| 'negativeLanguage'
	| 'apathyPhrases'
	| 'shortTurns'
	| 'empathyPhrases'
	// Cognitive: "mental fog"
	| 'repeatRequests'
	| 'selfCorrections'
	| 'lostThread';

/** What the voice analysis measures on one call, for the agent's voice only. */
export type CallVoiceSignals = Record<VoiceSignalKey, number>;

export interface VoiceSignalDef {
	key: VoiceSignalKey;
	family: VoiceFamily;
	dimension: BurnoutDimension;
	/** Short unit shown after a value: "wpm", "s", "/ 100", "per call". */
	unit: string;
	/** Which direction is worse: a flat voice is a LOWER pitch variability, more pauses is HIGHER. */
	worse: 'lower' | 'higher';
	decimals: number;
	/** How strongly the signal reflects fatigue or apathy, not how hard it is to measure. */
	confidence: 'high' | 'medium';
	/** A typical healthy value, used by the mock data. */
	typical: number;
	defaultWeight: number;
	/** Absolute limit: beyond it the signal is active whatever the agent's own baseline is. */
	defaultThreshold: number;
	/** Active when the signal moves this % from the agent's own baseline in the worse direction. */
	defaultDeviationPct: number;
}

export interface BurnoutSignalConfig {
	enabled: boolean;
	/** 1-5: how much an active signal adds to the score. */
	weight: number;
	threshold: number;
	deviationPct: number;
}

export type BurnoutBaselineMethod = 'FIRST_WEEKS' | 'ROLLING';
export type BurnoutWindowDays = 7 | 14 | 30;

/** Configuration of the burnout detection, saved from Settings. */
export interface BurnoutThresholds {
	signals: Record<VoiceSignalKey, BurnoutSignalConfig>;
	/** Days of calls each signal is aggregated over. */
	windowDays: BurnoutWindowDays;
	baseline: { method: BurnoutBaselineMethod; minCalls: number };
	/** Calls needed inside the window for a signal to count. */
	minCallsInWindow: number;
	/** Lower bounds of the Medium and High levels on the 0-100 score. */
	levelCuts: { medium: number; high: number };
	/** Fewer active signals than this keeps the agent at Low whatever the score. */
	minActiveSignals: number;
	/** Days of sustained signals that give the maximum persistence factor. */
	persistenceDays: number;
	/** Points added when signals are active in three or more families. */
	convergenceBonus: number;
}

export type BurnoutSignalStatus = 'ACTIVE' | 'NEAR' | 'OK' | 'NO_DATA';

/** One signal for one agent: where it stands now against their own baseline. */
export interface BurnoutSignalResult {
	key: VoiceSignalKey;
	family: VoiceFamily;
	status: BurnoutSignalStatus;
	/** Median over the window; null without enough calls. */
	value: number | null;
	baseline: number | null;
	/** % change against the baseline in the WORSE direction (positive = worse). */
	deviationPct: number | null;
	/** Whether the absolute limit is the reason it is active. */
	beyondThreshold: boolean;
	calls: number;
	/** Daily medians of the last 30 days, oldest first; null on days without calls. */
	trend: (number | null)[];
}

export interface BurnoutScore {
	/** 0-100. */
	score: number;
	level: 'low' | 'medium' | 'high';
	activeCount: number;
	nearCount: number;
	/** Families with at least one active signal. */
	activeFamilies: VoiceFamily[];
	/** Consecutive days, up to today, with signals active. */
	persistenceDays: number;
	signals: BurnoutSignalResult[];
	/** The active signal that deviates most, null when none is active. */
	primary: BurnoutSignalResult | null;
}
