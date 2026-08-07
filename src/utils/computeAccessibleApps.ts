import type { AppKey } from '~/hooks/useCurrentApp';
import { ModuleEnum } from '~/constants/ModuleEnum';
import type { PermissionMap } from '~/utils/permissionUtils';

/**
 * Whether the user can reach the Campaign-management (UCXM) app: they hold at
 * least one permission on any module other than Backoffice. A user whose only
 * access is Backoffice therefore does NOT count as having UCXM, so they skip
 * the app-chooser and go straight into Backoffice.
 */
export const hasUcxmAccess = (permissionMap: PermissionMap): boolean =>
	Object.entries(permissionMap).some(
		([module, permissions]) =>
			module !== ModuleEnum.BACKOFFICE_CASES &&
			!!permissions &&
			permissions.size > 0
	);

interface AccessibleAppsInput {
	hasUcxm: boolean;
	hasQa: boolean;
	hasBackoffice: boolean;
	hasEmotionSentiment?: boolean;
}

/**
 * The set of apps a user may enter, in display/priority order. Used to decide
 * whether the login app-chooser appears (2+ apps) and where a single-app user
 * lands. Never empty — falls back to UCXM so every user has a destination.
 */
export const computeAccessibleApps = ({
	hasUcxm,
	hasQa,
	hasBackoffice,
	hasEmotionSentiment,
}: AccessibleAppsInput): AppKey[] => {
	const apps: AppKey[] = [];
	if (hasUcxm) apps.push('ucxm');
	if (hasQa) apps.push('qa');
	if (hasEmotionSentiment) apps.push('emotion-sentiment');
	if (hasBackoffice) apps.push('backoffice');
	apps.push('coaching', 'lms');
	return apps.length ? apps : ['ucxm'];
};

/** Default entry path for an app (Backoffice then splits admin vs agent). */
export const appLandingPath = (app: AppKey): string => {
	switch (app) {
		case 'qa':
			return '/qa/dashboard';
		case 'emotion-sentiment':
			return '/workspace/emotion-sentiment';
		case 'compliance':
			return '/workspace/compliance';
		case 'business-insights':
			return '/workspace/business-insights';
		case 'backoffice':
			return '/backoffice';
		case 'coaching':
			return '/coaching';
		case 'lms':
			return '/lms';
		default:
			return '/';
	}
};
