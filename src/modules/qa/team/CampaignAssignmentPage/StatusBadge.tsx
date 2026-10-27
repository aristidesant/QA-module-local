import { Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { CampaignState } from '../campaignCatalog';
import type { AgentStatus } from '../types';

const STATUS_COLOR: Record<AgentStatus, string> = {
	active: 'green',
	inactive: 'gray',
};

const CAMPAIGN_STATE_COLOR: Record<CampaignState, string> = {
	active: 'green',
	paused: 'orange',
	pending: 'gray',
};

/** Where a campaign stands, with the colours the Campaigns list already uses. */
export function CampaignStateBadge({ state }: { state: CampaignState }) {
	const { t } = useTranslation('qa.team');
	return (
		<Badge variant='light' size='sm' color={CAMPAIGN_STATE_COLOR[state]}>
			{t(`campaignAssignment.campaignState.${state}`)}
		</Badge>
	);
}

/** Active or inactive, as a plain light badge. Read only on this page. */
export function StatusBadge({ status }: { status: AgentStatus }) {
	const { t } = useTranslation('qa.team');
	return (
		<Badge variant='light' size='sm' color={STATUS_COLOR[status]}>
			{t(`status.${status}`)}
		</Badge>
	);
}
