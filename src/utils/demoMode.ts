import type { MFALoginResponse } from '~/api/authApi';
import type { UserModel } from '~/models/UserModels';

/**
 * Demo mode: the login form accepts any username and password and signs in as
 * a mock user, with no backend call. Enabled at build time with
 * `VITE_APP_DEMO=true`, so a deployed mockup can be shared without credentials.
 */
export const isDemoMode = import.meta.env.VITE_APP_DEMO === 'true';

const DEMO_CLIENT_ID = 1;

const demoTimestamp = new Date().toISOString();

/** Signed in as QA admin of one client, so login lands straight in the QA app. */
export const DEMO_USER = {
	id: 1,
	username: 'asantana',
	email: 'aristides.02@gmail.com',
	firstName: 'Aristides',
	lastName: 'Santana',
	clientId: DEMO_CLIENT_ID,
	status: 'ACTIVE',
	createdAt: demoTimestamp,
	updatedAt: demoTimestamp,
	deletedAt: null,
	userRolesClient: [
		{
			userId: 1,
			roleId: 1,
			clientId: DEMO_CLIENT_ID,
			role: {
				id: 1,
				name: 'QA Admin',
				code: 'QA_ADMIN',
				isSystem: true,
				isActive: true,
				createdAt: demoTimestamp,
				updatedAt: demoTimestamp,
			},
		},
	],
} as UserModel;

/** A mock JWT that stays valid for 24 hours and carries the super admin role. */
const createDemoToken = (): string => {
	const now = Math.floor(Date.now() / 1000);
	const payload = {
		sub: String(DEMO_USER.id),
		email: DEMO_USER.email,
		username: DEMO_USER.username,
		iat: now,
		exp: now + 24 * 60 * 60,
		roles: ['SUPERADMIN'],
	};
	return `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(payload))}.demo-signature`;
};

/** What POST /auth/login would answer for a successful sign-in without OTP. */
export const createDemoLoginResponse = (): MFALoginResponse => ({
	message: 'Demo login',
	accessToken: createDemoToken(),
	userId: DEMO_USER.id,
	loginType: 'USER_PASS',
	otpEnabled: false,
	needToChangePassword: false,
	user: DEMO_USER,
});
