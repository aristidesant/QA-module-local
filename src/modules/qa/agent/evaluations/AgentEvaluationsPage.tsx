import React from 'react';
import { Stack, Title, Text } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';

/**
 * Agent Evaluations Page
 *
 * Displays a focused list of the agent's pending and completed evaluations.
 * Phase 2 implementation: placeholder for focused evaluations view.
 */
export const AgentEvaluationsPage: React.FC = () => {
	return (
		<ContentContainer>
			<Stack gap='lg'>
				<div>
					<Title order={1}>My Evaluations</Title>
					<Text c='dimmed' mt='xs'>
						Your pending and completed call evaluations
					</Text>
				</div>
				<Text size='sm' c='dimmed'>
					Evaluations view (coming soon). Currently view evaluations from your Dashboard.
				</Text>
			</Stack>
		</ContentContainer>
	);
};

export default AgentEvaluationsPage;
