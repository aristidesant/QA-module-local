// src/models/CampaignsModel.ts

import type { CampaignAgent } from './CampaignAgentModel';
import type { CampaignObjective } from './CampaignObjectiveModel';
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

export interface CampaignDataCollectionVariableDefinition {
	type?: 'boolean' | 'integer' | 'number' | 'string' | string;
	description?: string;
	enum?: string[];
	constantValue?: string;
	dynamicVariable?: string;
	isSystemProvided?: boolean;
	constant_value?: string;
	dynamic_variable?: string;
	is_system_provided?: boolean;
}

export interface CampaignDataCollectionVariable {
	id?: number;
	campaignId?: number;
	agentId?: string | null;
	key: string;
	label?: string | null;
	definition: CampaignDataCollectionVariableDefinition;
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export type CampaignPromptVariableSource = 'campaign' | 'schema' | 'system';

export interface CampaignPromptVariable {
	name: string;
	description?: string;
	source: CampaignPromptVariableSource;
}

export interface CampaignVoiceInput {
	voiceId: string;
	voiceName: string;
}

export interface CampaignVoice extends CampaignVoiceInput {
	condition?: string;
	originalVoiceName?: string;
	inherited?: boolean;
}

export interface Campaign {
	id: number;
	name: string;
	agentName: string;
	description: string;
	effectiveContactObjective?: string | null;
	budget: number;
	configId: string;
	spent: number;
	type: 'OUTBOUND' | 'INBOUND' | 'HYBRID';
	status: CampaignStatus;
	userId: number;
	clientId: number;
	promptId?: number;
	objectiveId?: number;
	voiceId?: string;
	voiceIds?: string[];
	voices?: CampaignVoice[];
	createdAt: string; // ISO date string
	updatedAt: string; // ISO date string
	overAllScore?: number;
	tags?: string[];
	workingHours?: WorkingHours;
	progress?: number; // Campaign progress percentage
	defaultMaxWaves?: number;
	defaultWaveExecutionDelaySeconds?: number;
	roleIds?: number[];
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
	agents?: CampaignAgent[];

	noiseCancellation?: boolean;
	showExternal?: boolean;
	/** Persisted node styles for the workflow editor (top-level campaign field) */
	nodeStyles?: NodeStyles;
	/** Persisted node groups for the workflow editor (top-level campaign field) */
	nodeGroups?: NodeGroups;
	dataCollectionVariables?: CampaignDataCollectionVariable[];
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
