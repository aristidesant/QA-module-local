import { create } from 'zustand';

type LoginType = 'USER_PASS' | 'LDAP';

interface PasswordResetState {
	pendingUsername: string | null;
	pendingLoginType: LoginType;
	setPendingCredentials: (username: string, loginType: LoginType) => void;
	clearPendingCredentials: () => void;
}

const DEFAULT_LOGIN_TYPE: LoginType = 'USER_PASS';

export const usePasswordResetStore = create<PasswordResetState>((set) => ({
	pendingUsername: null,
	pendingLoginType: DEFAULT_LOGIN_TYPE,
	setPendingCredentials: (username, loginType) =>
		set({ pendingUsername: username, pendingLoginType: loginType }),
	clearPendingCredentials: () =>
		set({ pendingUsername: null, pendingLoginType: DEFAULT_LOGIN_TYPE }),
}));

export default usePasswordResetStore;
