import { Badge, Text } from '@mantine/core';
import { IconMessage } from '@tabler/icons-react';
import type AgentListObject from '~/models/AgentListObject';
import RightSectionCard from '~/components/RightSectionCard';
import styles from './AgentBasicInfo.module.css';

type AgentBasicInfoProps = {
	agent: AgentListObject;
};

export const AgentBasicInfo: React.FC<AgentBasicInfoProps> = ({ agent }) => {
	const rawMessage =
		agent?.config?.conversationConfig?.agent?.first_message?.trim() || '';
	const hasMessage = rawMessage.length > 0;
	const displayMessage = hasMessage
		? rawMessage
		: 'No greeting configured. Set an opening message to warm up new conversations.';

	return (
		<RightSectionCard
			title='First Contact Message'
			description='Delivered automatically when a session starts'
			icon={IconMessage}
			iconColor='var(--mantine-color-blue-6)'
			rightSection={
				<Badge variant='light' size='sm' color={hasMessage ? 'teal' : 'gray'}>
					{hasMessage ? `${rawMessage.length} chars` : 'Not set'}
				</Badge>
			}
		>
			<Text className={styles.message}>{displayMessage}</Text>
		</RightSectionCard>
	);
};

export default AgentBasicInfo;
