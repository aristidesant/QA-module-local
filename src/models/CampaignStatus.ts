// src/models/CampaignStatus.ts

import {
	IconClock,
	IconPlayerPlay,
	IconPlayerPause,
	IconCheck,
	IconX,
	TablerIcon,
} from '@tabler/icons-react';

export enum CampaignStatus {
	PENDING = 'PENDING',
	RUNNING = 'RUNNING',
	PAUSED = 'PAUSED',
	COMPLETED = 'COMPLETED',
	FAILED = 'FAILED',
}

export type CampaignStatusConfigType = {
	label: string;
	color: string;
	icon: TablerIcon;
};

export const CampaignStatusConfig = {
	[CampaignStatus.PENDING]: {
		label: 'Pending',
		color: 'gray',
		icon: IconClock,
	},
	[CampaignStatus.RUNNING]: {
		label: 'Running',
		color: 'blue',
		icon: IconPlayerPlay,
	},
	[CampaignStatus.PAUSED]: {
		label: 'Paused',
		color: 'yellow',
		icon: IconPlayerPause,
	},
	[CampaignStatus.COMPLETED]: {
		label: 'Completed',
		color: 'green',
		icon: IconCheck,
	},
	[CampaignStatus.FAILED]: {
		label: 'Failed',
		color: 'red',
		icon: IconX,
	},
} as const;
