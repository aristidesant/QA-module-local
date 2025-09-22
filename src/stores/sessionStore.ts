import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserModel } from '~/models/UserModels';
import type { TargetClient } from '~/api/authApi';

interface SessionState {
	user: UserModel | null;
	token: string | null;
	targetClient: TargetClient | null;
	setUser: (user: UserModel | null) => void;
	setToken: (token: string | null) => void;
	setTargetClient: (targetClient: TargetClient | null) => void;
	clearUser: () => void;
	// Add hydration state for persistence
	_hasHydrated: boolean;
	_setHasHydrated: (hasHydrated: boolean) => void;
}

export const useSessionStore = create<SessionState>()(
	persist(
		(set) => ({
			user: null,
			token: null,
			targetClient: null,
			_hasHydrated: false,
			setToken: (token) => set({ token }),
			setUser: (user) => set({ user }),
			setTargetClient: (targetClient) => {
				set({ targetClient });
			},
			clearUser: () => {
				set({ user: null, targetClient: null });
			},
			_setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
		}),
		{
			name: 'session-storage',
			partialize: (state) => ({
				user: state.user,
				token: state.token,
				targetClient: state.targetClient,
			}),
			onRehydrateStorage: () => (state) => {
				state?._setHasHydrated(true);
			},
		}
	)
);
