import type { TablerIcon } from '@tabler/icons-react';
import {
	IconBell,
	IconSchool,
	IconSearch,
	IconTargetArrow,
	IconUsersGroup,
	IconClipboardCheck,
} from '@tabler/icons-react';

export interface RolePreviewPlaceholder {
	slug: string;
	titleKey: string;
	icon: TablerIcon;
}

export const ROLE_PREVIEW_PLACEHOLDERS: Record<string, RolePreviewPlaceholder> =
	{
		'your-evaluations': {
			slug: 'your-evaluations',
			titleKey: 'sidebar.rolePreview.items.yourEvaluations',
			icon: IconClipboardCheck,
		},
		notifications: {
			slug: 'notifications',
			titleKey: 'sidebar.rolePreview.items.notifications',
			icon: IconBell,
		},
		coaching: {
			slug: 'coaching',
			titleKey: 'sidebar.rolePreview.items.coaching',
			icon: IconTargetArrow,
		},
		lms: {
			slug: 'lms',
			titleKey: 'sidebar.rolePreview.items.lms',
			icon: IconSchool,
		},
		'agents-roster': {
			slug: 'agents-roster',
			titleKey: 'sidebar.rolePreview.items.agentsRoster',
			icon: IconUsersGroup,
		},
		finder: {
			slug: 'finder',
			titleKey: 'sidebar.rolePreview.items.finder',
			icon: IconSearch,
		},
	};
