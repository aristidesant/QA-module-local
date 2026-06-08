import { useMemo } from 'react';
import { usePermissions } from '~/hooks/usePermissions';
import { computeLandingPath } from '~/utils/computeLandingPath';

export const useLandingPath = (): string => {
	const { permissionMap } = usePermissions();

	return useMemo(() => computeLandingPath(permissionMap), [permissionMap]);
};
