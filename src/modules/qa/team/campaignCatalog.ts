import { TEAM_CAMPAIGNS } from './mockData';
import type { RosterCampaign } from './types';

/** Where a campaign stands: running, paused, or not started yet. Same three states as the Campaigns list. */
export type CampaignState = 'active' | 'paused' | 'pending';

/** A campaign of any client. The Operation Manager picks from this list when assigning campaigns to a supervisor. */
export interface ClientCampaign extends RosterCampaign {
	clientName: string;
	state: CampaignState;
	/** 'YYYY-MM-DD'. A pending campaign starts in the future. */
	startedAt: string;
}

/** The client behind the four roster campaigns the rest of the QA module already uses. */
const ROSTER_CLIENT = 'Global Services Corp';

/** State and start date of the roster campaigns, which are defined without them. */
const ROSTER_DETAILS: Record<
	string,
	{ state: CampaignState; startedAt: string }
> = {
	'camp-001': { state: 'active', startedAt: '2026-01-12' },
	'camp-002': { state: 'active', startedAt: '2026-02-02' },
	'camp-003': { state: 'paused', startedAt: '2026-07-01' },
	'camp-004': { state: 'active', startedAt: '2026-03-16' },
};

/**
 * Campaigns of other clients. No agent works on them yet: agents join a
 * campaign as its calls are ingested. Kept out of `TEAM_CAMPAIGNS` on purpose,
 * so analytics, reports and conversations filters do not list empty campaigns.
 */
const OTHER_CLIENT_CAMPAIGNS: ClientCampaign[] = [
	{
		id: 'camp-005',
		name: 'Holiday Sales',
		lineOfBusiness: 'Sales',
		campaignType: 'OUTBOUND',
		clientName: 'Acme Retail',
		state: 'pending',
		startedAt: '2026-11-02',
	},
	{
		id: 'camp-006',
		name: 'Order Support',
		lineOfBusiness: 'Customer Service',
		campaignType: 'INBOUND',
		clientName: 'Acme Retail',
		state: 'active',
		startedAt: '2026-04-06',
	},
	{
		id: 'camp-007',
		name: 'Returns Desk',
		lineOfBusiness: 'Customer Service',
		campaignType: 'INBOUND',
		clientName: 'Acme Retail',
		state: 'active',
		startedAt: '2026-05-18',
	},
	{
		id: 'camp-008',
		name: 'Card Services',
		lineOfBusiness: 'Customer Service',
		campaignType: 'INBOUND',
		clientName: 'Northwind Bank',
		state: 'active',
		startedAt: '2026-02-23',
	},
	{
		id: 'camp-009',
		name: 'Q4 Collections',
		lineOfBusiness: 'Collections',
		campaignType: 'BLENDED',
		clientName: 'Northwind Bank',
		state: 'paused',
		startedAt: '2026-08-10',
	},
	{
		id: 'camp-010',
		name: 'Fraud Alerts',
		lineOfBusiness: 'Fraud Prevention',
		campaignType: 'OUTBOUND',
		clientName: 'Northwind Bank',
		state: 'pending',
		startedAt: '2026-10-05',
	},
];

/** Every campaign of every client, roster campaigns first. */
export const ALL_CAMPAIGNS: ClientCampaign[] = [
	...TEAM_CAMPAIGNS.map((c) => ({
		...c,
		clientName: ROSTER_CLIENT,
		...(ROSTER_DETAILS[c.id] ?? {
			state: 'active' as const,
			startedAt: '2026-01-01',
		}),
	})),
	...OTHER_CLIENT_CAMPAIGNS,
];

/** Lines of business across every client, sorted, for the picker filter. */
export const CAMPAIGN_LINES: string[] = [
	...new Set(ALL_CAMPAIGNS.map((c) => c.lineOfBusiness)),
].sort((a, b) => a.localeCompare(b));

export const CAMPAIGN_STATES: CampaignState[] = ['active', 'paused', 'pending'];

export const clientCampaignById = (id: string): ClientCampaign | undefined =>
	ALL_CAMPAIGNS.find((c) => c.id === id);
