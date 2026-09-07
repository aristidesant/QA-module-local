/**
 * Mock Data for QA Platform
 * Comprehensive mock data for all roles and entities
 */

import type {
	Agent,
	Campaign,
	Supervisor,
	Evaluation,
	Client,
	AutoFail,
	RankingConfiguration,
	TriggerConfiguration,
	InboxItem,
} from './index';

// CLIENTS
export const mockClients: Client[] = [
	{
		id: 1,
		name: 'Global Services Corp',
		description: 'International customer service operations',
		qaStandard: 'COPC',
		sentimentScore: 3.8,
		status: 'ACTIVE',
		createdAt: '2024-01-15T00:00:00Z',
		updatedAt: '2024-09-07T00:00:00Z',
	},
];

// SUPERVISORS
export const mockSupervisors: Supervisor[] = [
	{
		id: 1,
		clientId: 1,
		userId: 101,
		name: 'Maria García',
		email: 'maria.garcia@client.com',
		createdAt: '2024-02-01T00:00:00Z',
		updatedAt: '2024-09-07T00:00:00Z',
	},
	{
		id: 2,
		clientId: 1,
		userId: 102,
		name: 'Juan Pérez',
		email: 'juan.perez@client.com',
		createdAt: '2024-02-01T00:00:00Z',
		updatedAt: '2024-09-07T00:00:00Z',
	},
];

// AGENTS
export const mockAgents: Agent[] = [
	// Team 1 (Maria's team)
	{
		id: 1,
		clientId: 1,
		supervisorId: 1,
		employeeId: 'AG001',
		agentType: 'HUMAN',
		firstName: 'Carlos',
		lastName: 'López',
		email: 'carlos.lopez@client.com',
		team: 'Team 1',
		createdAt: '2024-03-01T00:00:00Z',
		updatedAt: '2024-09-07T00:00:00Z',
	},
	{
		id: 2,
		clientId: 1,
		supervisorId: 1,
		employeeId: 'AG002',
		agentType: 'HUMAN',
		firstName: 'Ana',
		lastName: 'Martínez',
		email: 'ana.martinez@client.com',
		team: 'Team 1',
		createdAt: '2024-03-01T00:00:00Z',
		updatedAt: '2024-09-07T00:00:00Z',
	},
	{
		id: 3,
		clientId: 1,
		supervisorId: 1,
		employeeId: 'AG003',
		agentType: 'HUMAN',
		firstName: 'Roberto',
		lastName: 'Sánchez',
		email: 'roberto.sanchez@client.com',
		team: 'Team 1',
		createdAt: '2024-03-01T00:00:00Z',
		updatedAt: '2024-09-07T00:00:00Z',
	},
	// Team 2 (Juan's team)
	{
		id: 4,
		clientId: 1,
		supervisorId: 2,
		employeeId: 'AG004',
		agentType: 'HUMAN',
		firstName: 'Sofia',
		lastName: 'Rodríguez',
		email: 'sofia.rodriguez@client.com',
		team: 'Team 2',
		createdAt: '2024-03-15T00:00:00Z',
		updatedAt: '2024-09-07T00:00:00Z',
	},
	{
		id: 5,
		clientId: 1,
		supervisorId: 2,
		employeeId: 'AG005',
		agentType: 'HUMAN',
		firstName: 'Miguel',
		lastName: 'Fernández',
		email: 'miguel.fernandez@client.com',
		team: 'Team 2',
		createdAt: '2024-03-15T00:00:00Z',
		updatedAt: '2024-09-07T00:00:00Z',
	},
];

// CAMPAIGNS
export const mockCampaigns: Campaign[] = [
	{
		id: 1,
		clientId: 1,
		name: 'Q3 2024 Customer Service Campaign',
		description: 'Monthly evaluation campaign for Q3',
		status: 'ACTIVE',
		source: 'UCXM',
		createdAt: '2024-07-01T00:00:00Z',
		updatedAt: '2024-09-07T00:00:00Z',
	},
	{
		id: 2,
		clientId: 1,
		name: 'Compliance Training Campaign',
		description: 'Post-training evaluation campaign',
		status: 'ACTIVE',
		source: 'MANUAL_UPLOAD',
		createdAt: '2024-08-15T00:00:00Z',
		updatedAt: '2024-09-07T00:00:00Z',
	},
];

// EVALUATIONS (with COPC standard and 5.0 sentiment scale)
export const mockEvaluations: Evaluation[] = [
	{
		id: 1,
		agentId: 1,
		clientId: 1,
		supervisorId: 1,
		formId: 1,
		formName: 'COPC QA Form',
		campaignId: 1,
		evaluatorType: 'AI',
		version: 1,
		status: 'COMPLETED',
		overallScorePct: 85,
		qaMethod: 'COPC',
		qaDetails: {
			errorCriticoBusiness: 0, // ECN
			errorCriticoNonBusiness: 1, // ENC
			errorCriticoCompliance: 0, // ECC
			errorCriticoEndUser: 0, // ECUF
		},
		autoFailCount: 0,
		agentSentimentScore: 4, // 1-5 scale
		customerSentimentScore: 5, // 1-5 scale
		sentimentScale: 5.0,
		complianceScore: 90,
		createdAt: '2024-09-05T10:00:00Z',
		updatedAt: '2024-09-05T10:00:00Z',
	},
	{
		id: 2,
		agentId: 2,
		clientId: 1,
		supervisorId: 1,
		formId: 1,
		formName: 'COPC QA Form',
		campaignId: 1,
		evaluatorType: 'AI',
		version: 1,
		status: 'COMPLETED',
		overallScorePct: 78,
		qaMethod: 'COPC',
		qaDetails: {
			errorCriticoBusiness: 1, // ECN
			errorCriticoNonBusiness: 2, // ENC
			errorCriticoCompliance: 0, // ECC
			errorCriticoEndUser: 1, // ECUF
		},
		autoFailCount: 1,
		agentSentimentScore: 3, // 1-5 scale
		customerSentimentScore: 4, // 1-5 scale
		sentimentScale: 5.0,
		complianceScore: 85,
		createdAt: '2024-09-05T11:00:00Z',
		updatedAt: '2024-09-05T11:00:00Z',
	},
	{
		id: 3,
		agentId: 3,
		clientId: 1,
		supervisorId: 1,
		formId: 1,
		formName: 'COPC QA Form',
		campaignId: 1,
		evaluatorType: 'AI',
		version: 1,
		status: 'COMPLETED',
		overallScorePct: 92,
		qaMethod: 'COPC',
		qaDetails: {
			errorCriticoBusiness: 0, // ECN
			errorCriticoNonBusiness: 0, // ENC
			errorCriticoCompliance: 0, // ECC
			errorCriticoEndUser: 0, // ECUF
		},
		autoFailCount: 0,
		agentSentimentScore: 5, // 1-5 scale
		customerSentimentScore: 5, // 1-5 scale
		sentimentScale: 5.0,
		complianceScore: 95,
		createdAt: '2024-09-05T12:00:00Z',
		updatedAt: '2024-09-05T12:00:00Z',
	},
	{
		id: 4,
		agentId: 4,
		clientId: 1,
		supervisorId: 2,
		formId: 1,
		formName: 'COPC QA Form',
		campaignId: 1,
		evaluatorType: 'AI',
		version: 1,
		status: 'COMPLETED',
		overallScorePct: 88,
		qaMethod: 'COPC',
		qaDetails: {
			errorCriticoBusiness: 0, // ECN
			errorCriticoNonBusiness: 1, // ENC
			errorCriticoCompliance: 0, // ECC
			errorCriticoEndUser: 0, // ECUF
		},
		autoFailCount: 0,
		agentSentimentScore: 4, // 1-5 scale
		customerSentimentScore: 4, // 1-5 scale
		sentimentScale: 5.0,
		complianceScore: 92,
		createdAt: '2024-09-06T10:00:00Z',
		updatedAt: '2024-09-06T10:00:00Z',
	},
	{
		id: 5,
		agentId: 5,
		clientId: 1,
		supervisorId: 2,
		formId: 1,
		formName: 'COPC QA Form',
		campaignId: 1,
		evaluatorType: 'AI',
		version: 1,
		status: 'COMPLETED',
		overallScorePct: 75,
		qaMethod: 'COPC',
		qaDetails: {
			errorCriticoBusiness: 1, // ECN
			errorCriticoNonBusiness: 2, // ENC
			errorCriticoCompliance: 1, // ECC
			errorCriticoEndUser: 0, // ECUF
		},
		autoFailCount: 2,
		agentSentimentScore: 2, // 1-5 scale
		customerSentimentScore: 3, // 1-5 scale
		sentimentScale: 5.0,
		complianceScore: 80,
		createdAt: '2024-09-06T11:00:00Z',
		updatedAt: '2024-09-06T11:00:00Z',
	},
];

// RANKING CONFIGURATIONS
export const mockRankingConfigurations: RankingConfiguration[] = [
	{
		id: 1,
		clientId: 1,
		name: 'September Team 1 Rankings',
		description: 'Agent performance ranking for September',
		supervisorId: 1,
		entityType: 'AGENT',
		startDate: '2024-09-01',
		endDate: '2024-09-30',
		metrics: [
			{ type: 'QA', weight: 0.4 },
			{ type: 'SENTIMENT', weight: 0.3 },
			{ type: 'COMPLIANCE', weight: 0.3 },
		],
		displaySettings: {
			showAgentNames: true,
			showScores: true,
			maxDisplayCount: 10,
		},
		status: 'ACTIVE',
		createdAt: '2024-09-01T00:00:00Z',
		updatedAt: '2024-09-07T00:00:00Z',
	},
];

// TRIGGER CONFIGURATIONS
export const mockTriggerConfigurations: TriggerConfiguration[] = [
	{
		id: 1,
		clientId: 1,
		name: 'Low QA Alert',
		description: 'Alert when QA score drops below 75%',
		triggerType: 'QA',
		scope: 'TEAM',
		supervisorId: 1,
		conditions: [
			{
				field: 'qaScore',
				condition: 'LESS_THAN',
				value: 75,
			},
		],
		actions: ['ALERT'],
		priority: 'HIGH',
		status: 'ACTIVE',
		createdAt: '2024-09-01T00:00:00Z',
		updatedAt: '2024-09-07T00:00:00Z',
	},
	{
		id: 2,
		clientId: 1,
		name: 'Auto-Fail Count Alert',
		description: 'Alert if auto-fails exceed 2 in a campaign',
		triggerType: 'AUTO_FAILS',
		scope: 'CAMPAIGN',
		campaignId: 1,
		conditions: [
			{
				field: 'autoFailCount',
				condition: 'GREATER_THAN',
				value: 2,
			},
		],
		actions: ['ALERT'],
		priority: 'MEDIUM',
		status: 'ACTIVE',
		createdAt: '2024-09-01T00:00:00Z',
		updatedAt: '2024-09-07T00:00:00Z',
	},
];

// AUTO-FAILS
export const mockAutoFails: AutoFail[] = [
	{
		id: 1,
		formId: 1,
		questionId: 5,
		severity: 'SECTION_INVALIDATION',
		affectedSection: 'Customer Handling',
		createdAt: '2024-09-01T00:00:00Z',
		updatedAt: '2024-09-01T00:00:00Z',
	},
	{
		id: 2,
		formId: 1,
		questionId: 12,
		severity: 'EVALUATION_INVALIDATION',
		affectedSection: null,
		createdAt: '2024-09-01T00:00:00Z',
		updatedAt: '2024-09-01T00:00:00Z',
	},
];

// INBOX ITEMS
export const mockInboxItems: InboxItem[] = [
	{
		id: 1,
		agentId: 1,
		type: 'RANKING_NOTIFICATION',
		severity: 'LOW',
		title: 'You entered the rankings!',
		description: 'You are now #1 in September Team Rankings',
		relatedEntityId: 1,
		relatedEntityType: 'RANKING',
		isRead: false,
		createdAt: '2024-09-07T10:00:00Z',
	},
	{
		id: 2,
		agentId: 1,
		type: 'ACHIEVEMENT',
		severity: 'LOW',
		title: 'New Achievement Unlocked!',
		description: 'You achieved 5 consecutive perfect evaluations',
		relatedEntityId: 1,
		relatedEntityType: 'ACHIEVEMENT',
		isRead: false,
		createdAt: '2024-09-07T09:30:00Z',
	},
	{
		id: 3,
		agentId: 2,
		type: 'PERFORMANCE_ALERT',
		severity: 'HIGH',
		title: 'QA Score Below Threshold',
		description: 'Your QA score (72%) is below the team threshold (75%)',
		relatedEntityId: 2,
		relatedEntityType: 'EVALUATION',
		isRead: false,
		createdAt: '2024-09-06T16:45:00Z',
	},
];
