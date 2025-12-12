import { create } from 'zustand';
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
}

const ACCESS_TOKEN_KEY = 'accessToken';

export const useSessionStore = create<SessionState>()((set) => ({
	user: null,
	token: null,
	targetClient: null,
	setToken: (token) => {
		set({ token });
		if (typeof window === 'undefined') return;
		try {
			if (token) {
				window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
			} else {
				window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
			}
		} catch {
			// ignore storage errors
		}
	},
	setUser: (user) => set({ user }),
	setTargetClient: (targetClient) => set({ targetClient }),
	clearUser: () => set({ user: null, targetClient: null }),
}));
