import {
	IconArrowRight,
	IconRefresh,
	type TablerIcon,
} from '@tabler/icons-react';
import type { TFunction } from 'i18next';

export type ConversationActionKey = 'reprocess' | 'fetchAndProcess';

export type ConversationActionDefinition = {
	key: ConversationActionKey;
	icon: TablerIcon;
	label: string;
	hint: string;
	confirmMessage: string;
	confirmLabel: string;
	color: 'orange' | 'blue';
};

export const getConversationActionDefinition = (
	conversation: { status: string },
	t: TFunction
): ConversationActionDefinition => {
	if (conversation.status === 'initiated') {
		return {
			key: 'reprocess',
			icon: IconArrowRight,
			label: t('actions.reprocess.label'),
			hint: t('actions.reprocess.hint'),
			confirmMessage: t('actions.reprocess.confirmMessage'),
			confirmLabel: t('actions.reprocess.confirmLabel'),
			color: 'orange',
		};
	}

	return {
		key: 'fetchAndProcess',
		icon: IconRefresh,
		label: t('actions.fetchAndProcess.label'),
		hint: t('actions.fetchAndProcess.hint'),
		confirmMessage: t('actions.fetchAndProcess.confirmMessage'),
		confirmLabel: t('actions.fetchAndProcess.confirmLabel'),
		color: 'blue',
	};
};
