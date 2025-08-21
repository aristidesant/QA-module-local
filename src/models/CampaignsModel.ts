// src/models/CampaignsModel.ts

import type { AgentConfigModel } from "./AgentListObject";
import { CampaignAgent } from "./CampaignAgentModel";

export interface WorkingHours {
	[key: string]: {
		enabled: boolean;
		from: string;
		to: string;
	};
}

export interface ContactList {
	id: number;
	name: string;
	description?: string;
	totalContacts: number;
	lastUpdated?: string; // ISO date string
	status?: "active" | "inactive" | "processing" | "error";
	source?: "csv" | "api" | "manual" | string;
	tags?: string[];
	metadata?: {
		headers?: string[];
		importedAt?: string;
		importedBy?: string;
	};
}

export interface CampaignParameters {
	callingHours: {
		days: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
		startTime: string; // e.g. '09:00'
		endTime: string; // e.g. '18:00'
		timezone: string; // e.g. 'America/New_York'
	};
	voicemailDetection: boolean;
	callRetries: number;
	maxConcurrentCalls?: number;
	answerMachineDetection?: boolean;
}

export interface Campaign {
	id: number;
	name: string;
	description: string;
	budget: number;
	spent: number;
	type: "OUTBOUND" | "INBOUND";
	status: "ACTIVE" | "INACTIVE" | "PAUSED" | "COMPLETED" | "RUNNING";
	userId: number;
	clientId: number;
	promptId?: number;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	overAllScore: number;
	tags?: string[];
	workingHours?: WorkingHours;
	progress?: number; // Campaign progress percentage

	// User information
	user?: {
		id: number;
		username: string;
		email: string;
	};

	// Prompt information
	prompt?: {
		id: number;
		name: string;
	};

	// Agents assigned to campaign
	agents?: Array<{
		id: number;
		campaignId: number;
		agentId: string;
		agent: {
			name: string;
			status: string;
			language: string;
		};
		userId: number;
		clientId: number;
		createdAt: string;
		updatedAt: string;
	}>;

	agentConfig?: Partial<AgentConfigModel>;
	// Stats and performance
	stats?: {
		callsMade: number;
		callsAnswered: number;
		conversionRate: number;
		avgCallDuration: string;
		lastUpdated: string;
	};
	agentPerformance?: Array<{
		id: number;
		name: string;
		callsHandled: number;
		successRate: number;
		avgRating: number;
	}>;

	// New fields for enhanced preview
	assignedAgents?: CampaignAgent[];
	contactList?: ContactList;
	parameters?: CampaignParameters;
}

export interface PaginatedResponse<T> {
	total: number;
	limit: number;
	offset: number;
	data: T[];
}
