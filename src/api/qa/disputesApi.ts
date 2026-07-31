import type {
	CreateEvaluationDisputePayload,
	EvaluationDisputeDetail,
	EvaluationDisputeListQueryParams,
	EvaluationDisputeSummary,
} from '~/models/qa';
import { qaHttpClient } from '~/api/qa/qaConfig';
import { getMockDisputes, getMockDisputeById } from '~/api/qa/disputesMockData';

function normalizeDisputeSummary(
	dispute: EvaluationDisputeSummary
): EvaluationDisputeSummary {
	return {
		...dispute,
		before: {
			overallScore: Number(dispute.before.overallScore),
			overallScorePct: Number(dispute.before.overallScorePct),
			maxScore: Number(dispute.before.maxScore),
		},
		after: {
			overallScore: Number(dispute.after.overallScore),
			overallScorePct: Number(dispute.after.overallScorePct),
			maxScore: Number(dispute.after.maxScore),
		},
		scoreDelta: Number(dispute.scoreDelta),
	};
}

export async function createEvaluationDispute(
	evaluationId: number,
	payload: CreateEvaluationDisputePayload
) {
	const response = await qaHttpClient.post<EvaluationDisputeSummary>(
		`/evaluations/${evaluationId}/disputes`,
		payload
	);

	return normalizeDisputeSummary(response.data);
}

export async function getEvaluationDisputes(evaluationId: number) {
	const response = await qaHttpClient.get<EvaluationDisputeSummary[]>(
		`/evaluations/${evaluationId}/disputes`
	);

	return response.data.map(normalizeDisputeSummary);
}

export async function getDisputes(params?: EvaluationDisputeListQueryParams) {
	// Use mock data for demo purposes
	const mockData = getMockDisputes(
		params?.page ? (params.page - 1) * (params.limit || 25) : 0,
		params?.limit || 25
	);

	return {
		...mockData,
		data: mockData.data.map(normalizeDisputeSummary),
	};
}

export async function getDispute(disputeId: number) {
	// Use mock data for demo purposes
	const mockDispute = getMockDisputeById(disputeId);
	if (!mockDispute) {
		throw new Error(`Dispute ${disputeId} not found`);
	}

	// Mock QA form groups and questions with Yes/No/N/A options
	const mockGroups = [
		{
			name: 'Compliance Requirements',
			sortOrder: 1,
			questions: [
				{
					id: 1,
					evaluationId: mockDispute.sourceEvaluationId,
					groupName: 'Compliance Requirements',
					groupSortOrder: 1,
					text: 'Was the disclosure statement provided?',
					description:
						'Verify that the agent provided the required disclosure statement',
					answerType: 'CHOICE' as const,
					options: [
						{ label: 'Yes', score: 25 },
						{ label: 'No', score: 0 },
						{ label: 'N/A', score: 25 },
					],
					weight: 1,
					sortOrder: 1,
					answer: {
						id: 1,
						evaluationId: mockDispute.sourceEvaluationId,
						evaluationQuestionId: 1,
						selectedLabel: 'No',
						awardedScore: 0,
					},
				},
				{
					id: 2,
					evaluationId: mockDispute.sourceEvaluationId,
					groupName: 'Compliance Requirements',
					groupSortOrder: 1,
					text: 'Was the customer identity verified?',
					description: 'Confirm that the agent verified the customer identity',
					answerType: 'CHOICE' as const,
					options: [
						{ label: 'Yes', score: 25 },
						{ label: 'No', score: 0 },
						{ label: 'N/A', score: 25 },
					],
					weight: 1,
					sortOrder: 2,
					answer: {
						id: 2,
						evaluationId: mockDispute.sourceEvaluationId,
						evaluationQuestionId: 2,
						selectedLabel: 'No',
						awardedScore: 0,
					},
				},
			],
		},
	];

	// Create a mock detail object with source and resulting evaluations
	// For demo purposes, we'll use simplified mock data
	const mockDetail: EvaluationDisputeDetail = {
		...mockDispute,
		source: {
			id: mockDispute.sourceEvaluationId,
			version: mockDispute.sourceVersion ?? 1,
			status: 'COMPLETED',
			evaluatorType: mockDispute.sourceEvaluatorType ?? 'AI',
			formId: 1,
			formName: mockDispute.sourceFormName ?? 'Evaluation',
			agentId: 1,
			agent: {
				id: 1,
				firstName: mockDispute.sourceAgentName?.split(' ')[0] ?? 'Agent',
				lastName: mockDispute.sourceAgentName?.split(' ')[1] ?? 'Name',
				employeeId: 'EMP001',
				agentType: 'HUMAN',
			},
			evaluatorAgentId: null,
			evaluatorAgentName: mockDispute.sourceEvaluatorAgentName,
			evaluatorUserId: null,
			interactionId: 1,
			interactionRef: mockDispute.sourceInteractionRef,
			campaignId: 1,
			conversation: {
				id: '1',
				campaignId: 1,
				campaignName: mockDispute.sourceCampaignName ?? 'Campaign',
				externalRef: mockDispute.sourceInteractionRef ?? 'CALL-001',
				customerName: 'Customer',
				agentName: mockDispute.sourceAgentName ?? 'Agent',
				channel: 'PHONE',
				durationLabel: '5:30',
				occurredAt: mockDispute.createdAt,
			},
			overallScore: mockDispute.before.overallScore,
			overallScorePct: mockDispute.before.overallScorePct,
			maxScore: mockDispute.before.maxScore,
			groups: mockGroups,
		},
		resulting: {
			id: mockDispute.resultingEvaluationId,
			version: mockDispute.resultingVersion,
			status: 'COMPLETED',
			evaluatorType: mockDispute.resultingEvaluatorType ?? 'HUMAN',
			formId: 1,
			formName: mockDispute.resultingFormName ?? 'Evaluation',
			agentId: 1,
			agent: {
				id: 1,
				firstName: mockDispute.resultingAgentName?.split(' ')[0] ?? 'Agent',
				lastName: mockDispute.resultingAgentName?.split(' ')[1] ?? 'Name',
				employeeId: 'EMP001',
				agentType: 'HUMAN',
			},
			evaluatorAgentId: null,
			evaluatorAgentName: mockDispute.resultingEvaluatorAgentName,
			evaluatorUserId: null,
			interactionId: 1,
			interactionRef: mockDispute.resultingInteractionRef,
			campaignId: 1,
			conversation: {
				id: '1',
				campaignId: 1,
				campaignName: mockDispute.resultingCampaignName ?? 'Campaign',
				externalRef: mockDispute.resultingInteractionRef ?? 'CALL-001',
				customerName: 'Customer',
				agentName: mockDispute.resultingAgentName ?? 'Agent',
				channel: 'PHONE',
				durationLabel: '5:30',
				occurredAt: mockDispute.createdAt,
			},
			overallScore: mockDispute.after.overallScore,
			overallScorePct: mockDispute.after.overallScorePct,
			maxScore: mockDispute.after.maxScore,
			groups: mockGroups,
		},
	};

	return mockDetail;
}
