import { create } from 'zustand';

type Mode = 'view' | 'edit';

interface RegionalSettingsParamsState {
	mode: Mode;
	setMode: (mode: Mode) => void;
}

const useRegionalSettingsParamsStore = create<RegionalSettingsParamsState>(
	(set) => ({
		mode: 'view',
		setMode: (mode) => set({ mode }),
	})
);

export default useRegionalSettingsParamsStore;
