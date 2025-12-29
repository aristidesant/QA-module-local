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
		label: 'status.PENDING',
		color: 'gray',
		icon: IconClock,
	},
	[CampaignStatus.RUNNING]: {
		label: 'status.RUNNING',
		color: 'blue',
		icon: IconPlayerPlay,
	},
	[CampaignStatus.PAUSED]: {
		label: 'status.PAUSED',
		color: 'yellow',
		icon: IconPlayerPause,
	},
	[CampaignStatus.COMPLETED]: {
		label: 'status.COMPLETED',
		color: 'green',
		icon: IconCheck,
	},
	[CampaignStatus.FAILED]: {
		label: 'status.FAILED',
		color: 'red',
		icon: IconX,
	},
} as const;
