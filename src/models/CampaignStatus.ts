// src/models/CampaignStatus.ts

import {
	IconCircleCheck,
	IconCircleOff,
	IconX,
	TablerIcon,
} from '@tabler/icons-react';

export enum CampaignStatus {
	ACTIVE = 'ACTIVE',
	INACTIVE = 'INACTIVE',
	FAILED = 'FAILED',
}

export type CampaignStatusConfigType = {
	label: string;
	color: string;
	icon: TablerIcon;
};

export const CampaignStatusConfig = {
	[CampaignStatus.ACTIVE]: {
		label: 'status.ACTIVE',
		color: 'green',
		icon: IconCircleCheck,
	},
	[CampaignStatus.INACTIVE]: {
		label: 'status.INACTIVE',
		color: 'gray',
		icon: IconCircleOff,
	},
	[CampaignStatus.FAILED]: {
		label: 'status.FAILED',
		color: 'red',
		icon: IconX,
	},
} as const;
