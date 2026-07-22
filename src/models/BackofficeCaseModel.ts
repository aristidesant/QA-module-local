export type BackofficeCaseStatus = 'UNASSIGNED' | 'ASSIGNED' | 'MANAGED';

export type BackofficeCaseHistoryEventType =
	| 'CREATED'
	| 'ASSIGNED'
	| 'TRANSFERRED'
	| 'UNASSIGNED'
	| 'STATUS_CHANGED'
	| 'SOURCE_UPDATED';

export interface BackofficeContact {
	id: number;
	firstName: string;
	lastName: string;
}

export interface BackofficeCampaign {
	id: number;
	name: string;
}

export interface BackofficeContactGroup {
	id: number;
	name: string;
}

export interface BackofficeUser {
	id: number;
	username: string;
	firstName: string | null;
	lastName: string | null;
}

export interface BackofficeConversation {
	id: number;
	identifier: string | null;
	startDate: string | null;
	endDate: string | null;
	createdAt?: string;
}

export interface BackofficeDisposition {
	id: number;
	dispositionName: string;
	contactOutcome: string | null;
	createdAt?: string;
}

export interface BackofficeCase {
	id: number;
	clientId: number;
	contactId: number;
	status: BackofficeCaseStatus;
	assignedUserId: number | null;
	latestConversationId: number;
	latestDispositionId: number;
	contact?: BackofficeContact;
	campaign?: BackofficeCampaign;
	contactGroup: BackofficeContactGroup | null;
	latestConversation?: BackofficeConversation;
	latestDisposition?: BackofficeDisposition;
	assignedUser: BackofficeUser | null;
	assignedAt: string | null;
	managedAt: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface BackofficeCaseListResponse {
	data: BackofficeCase[];
	total: number;
	limit: number;
	offset: number;
}

export interface BackofficeCaseHistory {
	id: number;
	clientId: number;
	backofficeCaseId: number;
	actorUserId: number | null;
	eventType: BackofficeCaseHistoryEventType;
	previousStatus: BackofficeCaseStatus | null;
	newStatus: BackofficeCaseStatus | null;
	previousAssignedUserId: number | null;
	newAssignedUserId: number | null;
	previousConversationId: number | null;
	newConversationId: number | null;
	createdAt: string;
	actorUser: BackofficeUser | null;
}

export interface DistributeBackofficeCasesResponse {
	requested: number;
	assigned: number;
	remainingUnassigned: number;
}

export interface BackofficeSupervisorDashboardParams {
	from: string;
	to: string;
	campaignId?: number;
	contactGroupId?: number;
	assignedUserId?: number;
}

export interface BackofficeSupervisorDashboard {
	period: {
		from: string;
		to: string;
	};
	kpis: {
		total: number;
		pending: number;
		unassigned: number;
		assigned: number;
		managed: number;
		eligibleAgents: number;
	};
	statusBreakdown: Array<{
		status: BackofficeCaseStatus;
		count: number;
	}>;
	dailyTrend: Array<{
		date: string;
		created: number;
		managed: number;
	}>;
	agentWorkload: Array<{
		agentId: number;
		agentName: string;
		assigned: number;
		managed: number;
	}>;
}
