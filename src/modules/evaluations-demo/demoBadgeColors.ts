import type {
	DemoCallStatus,
	DemoCampaignStatus,
	DemoHealth,
	DemoPassFail,
} from './mockData';

export const DEMO_HEALTH_COLORS: Record<DemoHealth, string> = {
	healthy: 'green',
	atRisk: 'yellow',
	critical: 'red',
};

export const DEMO_HEALTH_LABELS: Record<DemoHealth, string> = {
	healthy: 'Good',
	atRisk: 'Fair',
	critical: 'Poor',
};

export const DEMO_CALL_STATUS_COLORS: Record<DemoCallStatus, string> = {
	completed: 'green',
	pending: 'gray',
};

export const DEMO_PASS_FAIL_COLORS: Record<DemoPassFail, string> = {
	pass: 'green',
	fail: 'red',
};

export const DEMO_PASS_FAIL_LABELS: Record<DemoPassFail, string> = {
	pass: 'Passed',
	fail: 'Failed',
};

export const DEMO_CAMPAIGN_STATUS_COLORS: Record<DemoCampaignStatus, string> = {
	active: 'green',
	pending: 'gray',
	paused: 'orange',
};
