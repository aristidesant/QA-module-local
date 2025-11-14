export interface IneffectiveReason {
	label: string;
	count: number;
	percentage: string;
}

export interface NoContactReason {
	label: string;
	count: number;
	percentage: string;
}

export interface SpecificMetric {
	key: string;
	label: string;
	value: number;
	meta?: {
		conversationsMeasured: number;
	};
}

export interface GeneralKPIs {
	totalRecords: number;
	contacts: number;
	effectiveContacts: number;
	noEffectiveContacts: number;
	noContact: number;
	dnc: number;
	contactRate: string;
	effectivenessRate: string;
	noContactRate: string;
}

export interface Breakdowns {
	ineffectiveReasons: IneffectiveReason[];
	noContactReasons: NoContactReason[];
}

export interface KPIs {
	general: GeneralKPIs;
	breakdowns: Breakdowns;
	specifics: SpecificMetric[];
}

export interface LiveMetricsResponse {
	contactGroupId: number;
	name: string;
	queueStatus: string;
	isActive: boolean;
	kpis: KPIs;
}
