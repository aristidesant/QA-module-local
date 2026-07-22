import { create } from 'zustand';
import type { AppKey } from '~/hooks/useCurrentApp';

interface AppTransitionState {
	/** Destination app while a switch transition is showing; null when idle. */
	target: AppKey | null;
	start: (target: AppKey) => void;
	stop: () => void;
}

/**
 * Drives the full-screen overlay shown while switching between Campaign
 * management and the QA app. The switch itself is instant client-side
 * navigation; the overlay provides a brief, deliberate transition so the user
 * understands they are moving between apps.
 */
export const useAppTransitionStore = create<AppTransitionState>((set) => ({
	target: null,
	start: (target) => set({ target }),
	stop: () => set({ target: null }),
}));
