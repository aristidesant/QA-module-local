import { create } from 'zustand';
import { DEFAULT_SETTINGS } from '~/modules/qa/settings/constants';
import type {
	BurnoutSettings,
	SettingsAspect,
	ThresholdSettings,
} from '~/modules/qa/settings/types';

/**
 * Selector warning (Zustand v5): select the raw slice (`selectThresholds`) and derive with useMemo —
 * selectors that return a new object/array on every call can throw "Maximum update depth exceeded".
 */
interface SettingsState {
	thresholds: ThresholdSettings;
	burnout: BurnoutSettings;
	/** ISO timestamp of the last save, null until something is saved. */
	updatedAt: string | null;

	/** Replaces one aspect's thresholds. */
	saveThresholds: <A extends SettingsAspect>(
		aspect: A,
		value: ThresholdSettings[A]
	) => void;
	saveBurnout: (value: BurnoutSettings) => void;
	resetAspect: (aspect: SettingsAspect) => void;
	resetBurnout: () => void;
	resetAll: () => void;
}

const now = () => new Date().toISOString();

export const useSettingsStore = create<SettingsState>()((set) => ({
	thresholds: DEFAULT_SETTINGS.thresholds,
	burnout: DEFAULT_SETTINGS.burnout,
	updatedAt: null,

	saveThresholds: (aspect, value) =>
		set((s) => ({
			thresholds: { ...s.thresholds, [aspect]: value },
			updatedAt: now(),
		})),
	saveBurnout: (value) => set({ burnout: value, updatedAt: now() }),
	resetAspect: (aspect) =>
		set((s) => ({
			thresholds: {
				...s.thresholds,
				[aspect]: DEFAULT_SETTINGS.thresholds[aspect],
			},
			updatedAt: now(),
		})),
	resetBurnout: () =>
		set({ burnout: DEFAULT_SETTINGS.burnout, updatedAt: now() }),
	resetAll: () =>
		set({
			thresholds: DEFAULT_SETTINGS.thresholds,
			burnout: DEFAULT_SETTINGS.burnout,
			updatedAt: now(),
		}),
}));

export const selectThresholds = (s: SettingsState) => s.thresholds;
export const selectBurnout = (s: SettingsState) => s.burnout;
export const selectUpdatedAt = (s: SettingsState) => s.updatedAt;
