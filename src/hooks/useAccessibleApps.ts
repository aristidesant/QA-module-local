import { useMemo } from 'react';
import type { AppKey } from '~/hooks/useCurrentApp';
import { usePermissions } from '~/hooks/usePermissions';
import { useIsQaAdmin } from '~/hooks/useIsQaAdmin';
import { useBackofficeRole } from '~/modules/backoffice/hooks/useBackofficeRole';
import {
	computeAccessibleApps,
	hasUcxmAccess,
} from '~/utils/computeAccessibleApps';

/**
 * The apps the current session may enter (UCXM / QA / Backoffice). Drives the
 * user-menu app switch and any 2+-apps gating. Mirrors the pure computation the
 * login flow runs against the session store.
 */
export const useAccessibleApps = (): AppKey[] => {
	const { permissionMap } = usePermissions();
	const isQaAdmin = useIsQaAdmin();
	const { hasBackofficeRole } = useBackofficeRole();

	return useMemo(
		() =>
			computeAccessibleApps({
				hasUcxm: hasUcxmAccess(permissionMap),
				hasQa: isQaAdmin,
				hasBackoffice: hasBackofficeRole,
				hasEmotionSentiment: isQaAdmin,
				hasCompliance: isQaAdmin,
				hasBusinessInsights: isQaAdmin,
			}),
		[permissionMap, isQaAdmin, hasBackofficeRole]
	);
};

export default useAccessibleApps;
