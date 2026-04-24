// src/models/CampaignsModel.ts

import type { AgentConfigModel } from './AgentListObject';
import { CampaignAgent } from './CampaignAgentModel';
import { CampaignObjective } from './CampaignObjectiveModel';
import { CampaignStatus } from './CampaignStatus';

/**
 * Persisted style for a single workflow node.
 * Stored as a top-level `node_styles` JSON column on the campaign record.
 */
export interface NodeStyle {
	/** Human-readable node label snapshot (informational, not authoritative) */
	nodeLabel?: string;
	/** CSS hex color for the node background (omit to keep automatic label-based tone) */
	backgroundColor?: string;
	/** CSS hex color for the node border */
	borderColor?: string;
	/** CSS hex color for the node label text */
	textColor?: string;
	/** Icon key from the allowed workflow icon registry (e.g. "telephone") */
	iconName?: string;
}

/**
 * Map of node ID → persisted node style.
 * Absent / empty = UI falls back to automatic label-based colors.
 */
export type NodeStyles = Record<string, NodeStyle>;

/**
 * Persisted group-node definition.
 * Stored as a top-level `node_groups` JSON column on the campaign record,
 * separate from `agentConfig.workflow.nodes` (which the backend validates
 * against its own node-type enum and rejects `type: "group"`).
 */
export interface NodeGroup {
	label?: string;
	position: { x: number; y: number };
	width?: number;
	height?: number;
	/** CSS hex color for the group border/background tint */
	color?: string;
	/** IDs of workflow nodes that belong to this group */
	childNodeIds: string[];
}

/**
 * Map of group-node ID → persisted group definition.
 */
export type NodeGroups = Record<string, NodeGroup>;

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
	status?: 'active' | 'inactive' | 'processing' | 'error';
	source?: 'csv' | 'api' | 'manual' | string;
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
	agentName: string;
	description: string;
	budget: number;
	configId: string;
	spent: number;
	type: 'OUTBOUND' | 'INBOUND';
	status: CampaignStatus;
	userId: number;
	clientId: number;
	promptId?: number;
	objectiveId?: number;
	voiceId?: string;
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	overAllScore?: number;
	tags?: string[];
	workingHours?: WorkingHours;
	progress?: number; // Campaign progress percentage
	defaultMaxWaves?: number;
	defaultWaveExecutionDelaySeconds?: number;
	isDraft?: boolean; // Indicates if campaign is in draft state
	draftStep?: number; // The wizard step where the draft was saved

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

	// Objective information
	objective?: CampaignObjective;

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

	noiseCancellation?: boolean;
	agentConfig?: Partial<AgentConfigModel>;
	/** Persisted node styles for the workflow editor (top-level campaign field) */
	nodeStyles?: NodeStyles;
	/** Persisted node groups for the workflow editor (top-level campaign field) */
	nodeGroups?: NodeGroups;
	versionDescription?: string;
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

export interface SchedulerSummary {
	id: number;
	scheduleId: number;
	dayOfWeek: string;
	dayOrder: number;
	isActive: boolean;
	startHour: string;
	endHour: string;
}
