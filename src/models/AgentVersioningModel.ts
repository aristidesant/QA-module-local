import type { AgentConfigModel } from './AgentListObject';

export interface EnableAgentVersioningResponse {
	agentId: string;
	versioningEnabled: boolean;
	message: string;
}

export interface AgentVersionAccessInfo {
	isCreator?: boolean;
	creatorName?: string;
	creatorEmail?: string;
	role?: string;
}

export interface AgentVersionAppUser {
	userId: number;
	userName?: string;
	userEmail: string;
}

export interface AgentBranchSummary {
	id: string;
	name: string;
	agentId: string;
	description: string;
	createdAt: number;
	lastCommittedAt: number;
	isArchived: boolean;
	currentLivePercentage: number;
	draftExists: boolean;
}

export interface AgentVersionSummary {
	id: string;
	agentId: string;
	branchId: string;
	versionDescription: string;
	seqNoInBranch: number;
	timeCommittedSecs: number;
	parents?: {
		inBranchParentId?: string;
	};
	accessInfo?: AgentVersionAccessInfo;
	appUser?: AgentVersionAppUser;
}

export interface AgentVersionPaginatedList {
	data: AgentVersionSummary[];
	total: number;
	limit: number;
	offset: number;
}

export interface AgentBranchDetails extends AgentBranchSummary {
	protectionStatus?: string;
	accessInfo?: AgentVersionAccessInfo;
	parentBranch?: {
		id: string;
		name: string;
	};
	mostRecentVersions: AgentVersionPaginatedList;
}

export interface AgentBranchListResponse {
	results: AgentBranchSummary[];
}

export interface AgentVersionQueryParams {
	branchId?: string;
	versionId?: string;
}

export interface GetBranchDetailsParams {
	limit?: number;
	offset?: number;
	filter?: VersionCommitFilter;
}

export type AgentVersionSnapshot = Partial<
	Omit<AgentConfigModel, 'metadata' | 'workflow'>
> & {
	name?: string;
};

export interface AgentVersionCommit {
	id: number;
	agentId: string;
	branchId: string;
	versionId: string | null;
	commitType: 'CREATE_BRANCH' | 'BRANCH_UPDATE' | 'MERGE';
	userId: number;
	userName: string;
	userEmail: string;
	createdAt: string;
	versionDescription?: string;
}

export type VersionCommitFilter = 'ACTIVE' | 'DELETED' | 'ALL';

export interface ListVersionCommitsParams {
	branchId?: string;
	filter?: VersionCommitFilter;
}

export interface AgentVersionCommitListResponse {
	results: AgentVersionCommit[];
}

export type AgentVersionUpdatePayload = Partial<
	Pick<
		AgentConfigModel,
		| 'conversationConfig'
		| 'platformSettings'
		| 'privacy'
		| 'overrides'
		| 'callLimits'
		| 'evaluation'
		| 'dataCollection'
		| 'workspaceOverrides'
		| 'phoneNumbers'
		| 'tags'
	>
> & {
	name?: string;
};
