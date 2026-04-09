import React from 'react';
import { IconPhoneCall } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import AppDrawer from '~/components/AppDrawer';
import ConversationDetails from '~/modules/conversations/ConversationDetails';
import styles from './ConversationDetailDrawer.module.css';

interface ConversationDetailDrawerProps {
	conversationId: number | null;
	opened: boolean;
	onClose: () => void;
}

const ConversationDetailDrawer: React.FC<ConversationDetailDrawerProps> = ({
	conversationId,
	opened,
	onClose,
}) => {
	const { t } = useTranslation('conversations');

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			title={t('drawer.title')}
			icon={<IconPhoneCall size={16} />}
			size='xl'
			classNames={{
				content: styles.drawerContent,
				body: styles.drawerBody,
			}}
		>
			{conversationId ? <ConversationDetails id={conversationId} /> : null}
		</AppDrawer>
	);
};

export default ConversationDetailDrawer;
