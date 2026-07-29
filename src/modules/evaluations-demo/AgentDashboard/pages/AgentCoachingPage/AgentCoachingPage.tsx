import React from 'react';
import { Stack, Title, Text } from '@mantine/core';
import { useNavigate } from 'react-router';
import ContentContainer from '~/components/ContentContainer';
import BaseTable from '~/components/BaseTable';
import { useCoachingColumns } from './useCoachingColumns';
import { DEMO_COACHING_REPORTS } from '../../mockData';

const AgentCoachingPage: React.FC = () => {
	const navigate = useNavigate();
	const columns = useCoachingColumns();

	return (
		<ContentContainer>
			<Stack gap='lg'>
				<div>
					<Title order={2} mb='xs'>
						Weekly Coaching Reports
					</Title>
					<Text size='sm' c='dimmed'>
						Performance analysis and recommendations per campaign
					</Text>
				</div>

				<BaseTable
					data={DEMO_COACHING_REPORTS}
					columns={columns}
					getRowId={(report) => report.id}
					density='compact'
					filterMode='client'
					onRowClick={(report) =>
						navigate(
							`/role-preview/agent-dashboard/coaching/${report.id}`
						)
					}
				/>

				<Text size='sm' c='dimmed'>
					{DEMO_COACHING_REPORTS.length} coaching reports available
				</Text>
			</Stack>
		</ContentContainer>
	);
};

export default AgentCoachingPage;
