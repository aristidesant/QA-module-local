import { Badge, Text } from '@mantine/core';
import { IconNotebook } from '@tabler/icons-react';
import type AgentListObject from '~/models/AgentListObject';
import RightSectionCard from '~/components/RightSectionCard';
import styles from './AgentPromptDisplay.module.css';

type AgentPromptDisplayProps = {
	agent: AgentListObject;
};

export const AgentPromptDisplay: React.FC<AgentPromptDisplayProps> = ({
	agent,
}) => {
	const prompt =
		agent?.config?.conversationConfig?.agent?.prompt?.prompt?.trim() || '';
	const hasPrompt = prompt.length > 0;

	const previewCopy = hasPrompt
		? prompt
		: 'No system prompt is configured. Provide guidance so the agent stays on brand.';

	return (
		<RightSectionCard
			title='System Prompt'
			description='Tone, persona, and guardrails for the conversation'
			icon={IconNotebook}
			rightSection={
				<Badge variant='light' size='sm' color={hasPrompt ? 'blue' : 'gray'}>
					{hasPrompt ? `${prompt.length} chars` : 'Not set'}
				</Badge>
			}
		>
			<Text className={styles.prompt}>{previewCopy}</Text>
		</RightSectionCard>
	);
};

export default AgentPromptDisplay;
