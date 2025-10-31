import { create } from 'zustand';
import type { ReactNode } from 'react';
import type { CampaignPredefinedParam } from '~/modules/campaigns/CampaignsForm/useCampaignsPredefinedParams';

type Mode = 'view' | 'edit' | 'create';

interface CampaignPredefinedParamsState {
	selectedParam: CampaignPredefinedParam | null;
	rightComponent: ReactNode | null;
	mode: Mode;
	setSelectedParam: (param: CampaignPredefinedParam | null) => void;
	setRightComponent: (component: ReactNode | null) => void;
	setMode: (mode: Mode) => void;
	clearRightComponent: () => void;
}

const useCampaignPredefinedParamsStore = create<CampaignPredefinedParamsState>(
	(set) => ({
		selectedParam: null,
		rightComponent: null,
		mode: 'view',
		setSelectedParam: (param) => set({ selectedParam: param }),
		setRightComponent: (component) => set({ rightComponent: component }),
		setMode: (mode) => set({ mode }),
		clearRightComponent: () =>
			set({ rightComponent: null, selectedParam: null, mode: 'view' }),
	})
);

export default useCampaignPredefinedParamsStore;
