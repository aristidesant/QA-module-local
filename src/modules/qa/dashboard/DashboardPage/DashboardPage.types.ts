import type { AiEvaluationStatus } from '~/models/qa';

export interface DashboardKpis {
	/** Evaluations created in the selected range (window-bound except ALL). */
	evaluationsCount: number;
	completedCount: number;
	/** Average overallScorePct across completed evaluations with a score. */
	avgScorePct: number | null;
	aiEvaluationsCount: number;
	/** FAILED / all AI evaluations in range, as 0-100. */
	aiFailureRatePct: number | null;
	disputesCount: number;
	/** Average scoreDelta across the fetched disputes page. */
	avgScoreDelta: number | null;
}

export interface TrendBucket {
	label: string;
	created: number;
	completed: number;
}

export interface AiStatusSegment {
	status: AiEvaluationStatus;
	count: number;
}

export interface AgentScoreBar {
	agentId: number;
	agentName: string;
	avgScorePct: number;
	evaluationsCount: number;
}
