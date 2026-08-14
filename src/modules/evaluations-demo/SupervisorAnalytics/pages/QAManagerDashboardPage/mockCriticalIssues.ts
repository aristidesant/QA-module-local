export const mockCriticalIssuesQAManager = [
	{
		id: 'critical-1',
		type: 'compliance' as const,
		title: 'Compliance Critical',
		count: 8,
		severity: 'critical' as const,
		description: 'High/critical severity policy violations detected',
		affectedEntities: ['Sarah Chen', 'Marcus Johnson', 'James Wilson'],
		trend: 'up' as const,
	},
	{
		id: 'critical-2',
		type: 'emotion' as const,
		title: 'Emotional Distress',
		count: 12,
		severity: 'high' as const,
		description:
			'Calls with anger/frustration/sadness detected above threshold',
		affectedEntities: ['James Wilson', 'Elena Rodriguez'],
		trend: 'up' as const,
	},
	{
		id: 'critical-3',
		type: 'autofail' as const,
		title: 'System AutoFails',
		count: 3,
		severity: 'critical' as const,
		description:
			'Global autofails (2) and section autofails (1) affecting agent evaluations',
		affectedEntities: ['Support Team', 'Billing Team'],
		trend: 'stable' as const,
	},
	{
		id: 'critical-4',
		type: 'recovery' as const,
		title: 'Recovery Failures',
		count: 5,
		severity: 'high' as const,
		description: 'Calls unable to recover from negative sentiment',
		affectedEntities: ['Mike Chen', 'Emma Davis', 'John Smith'],
		trend: 'down' as const,
	},
];

export const mockCriticalIssuesSupervisor = (supervisorName: string) => {
	// Filter critical issues by supervisor for team-scoped view
	const supervisorTeams: Record<string, string[]> = {
		'Sarah Chen': ['Billing Team', 'Support Team'],
		'Marcus Johnson': ['Technical Team'],
		'James Wilson': ['General Inquiries'],
		'Elena Rodriguez': ['VIP Team'],
		'Michael Torres': ['Support Team'],
	};

	const affectedTeams = supervisorTeams[supervisorName] || [];

	return mockCriticalIssuesQAManager.filter((issue) =>
		issue.affectedEntities.some(
			(entity) => affectedTeams.includes(entity) || entity === supervisorName
		)
	);
};
