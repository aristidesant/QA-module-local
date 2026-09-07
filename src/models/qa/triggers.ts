import type { ListQueryParams } from './shared';

export type TriggerType = 'QA' | 'SENTIMENT' | 'COMPLIANCE' | 'AUTO_FAILS';
export type TriggerConfigScope = 'TEAM' | 'GLOBAL' | 'CAMPAIGN';
export type TriggerCondition = 'GREATER_THAN' | 'LESS_THAN' | 'EQUALS' | 'NOT_EQUALS' | 'BETWEEN';
export type TriggerAction = 'ALERT' | 'AUTO_RECOGNIZE' | 'ESCALATE';

export interface TriggerConditionConfig {
	field: string;
	condition: TriggerCondition;
	value: number | string;
	value2?: number | string;
}

export interface TriggerConfigurationListQueryParams extends ListQueryParams {
	supervisorId?: number;
	triggerType?: TriggerType;
	scope?: TriggerScope;
	status?: 'ACTIVE' | 'INACTIVE';
	sortBy?: 'id' | 'name' | 'triggerType' | 'createdAt';
	orderBy?: 'ASC' | 'DESC';
}

export interface TriggerConfiguration {
	id: number;
	clientId?: number;
	name: string;
	description?: string | null;
	triggerType: TriggerType;
	scope: TriggerScope;
	supervisorId?: number;
	campaignId?: number;
	conditions: TriggerConditionConfig[];
	actions: TriggerAction[];
	priority?: 'LOW' | 'MEDIUM' | 'HIGH';
	status: 'ACTIVE' | 'INACTIVE';
	createdAt?: string;
	updatedAt?: string;
}

export interface GlobalTrigger extends TriggerConfiguration {
	scope: 'GLOBAL';
	campaignOverrides?: TriggerConfiguration[];
}

export interface TeamTrigger extends TriggerConfiguration {
	scope: 'TEAM';
	supervisorId: number;
	teamSize?: number;
}

export interface CampaignTriggerOverride extends TriggerConfiguration {
	scope: 'CAMPAIGN';
	baseTriggerId?: number;
	campaignId: number;
}

export interface CreateTriggerConfigurationPayload {
	name: string;
	description?: string;
	triggerType: TriggerType;
	scope: TriggerScope;
	supervisorId?: number;
	campaignId?: number;
	conditions: TriggerConditionConfig[];
	actions: TriggerAction[];
	priority?: 'LOW' | 'MEDIUM' | 'HIGH';
	status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateTriggerConfigurationPayload {
	name?: string;
	description?: string | null;
	conditions?: TriggerConditionConfig[];
	actions?: TriggerAction[];
	priority?: 'LOW' | 'MEDIUM' | 'HIGH';
	status?: 'ACTIVE' | 'INACTIVE';
}

export interface TriggerLog {
	id: number;
	triggerId: number;
	evaluationId: number;
	actionTaken: TriggerAction;
	createdAt?: string;
}
