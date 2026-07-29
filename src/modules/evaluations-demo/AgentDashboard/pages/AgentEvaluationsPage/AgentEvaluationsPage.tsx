import React, { useMemo, useState } from 'react';
import { Stack, Title, Text } from '@mantine/core';
import { useNavigate } from 'react-router';
import ContentContainer from '~/components/ContentContainer';
import BaseTable from '~/components/BaseTable';
import EvaluationFiltersBar, {
	type EvaluationFilters,
} from './components/EvaluationFiltersBar';
import { useEvaluationColumns } from './useEvaluationColumns';
import { DEMO_AGENT_CALLS } from '../../mockData';

const AgentEvaluationsPage: React.FC = () => {
	const navigate = useNavigate();
	const columns = useEvaluationColumns();
	const [filters, setFilters] = useState<EvaluationFilters>({
		campaigns: [],
		period: 'weekly',
		scoreMin: 0,
		scoreMax: 100,
		dispute: 'all',
		result: 'all',
		evaluationTypes: [],
	});

	const uniqueCampaigns = useMemo(
		() => [...new Set(DEMO_AGENT_CALLS.map((call) => call.campaign))],
		[]
	);

	const filteredCalls = useMemo(() => {
		return DEMO_AGENT_CALLS.filter((call) => {
			if (filters.campaigns.length > 0 && !filters.campaigns.includes(call.campaign)) {
				return false;
			}

			if (call.score < filters.scoreMin || call.score > filters.scoreMax) {
				return false;
			}

			if (filters.dispute === 'yes' && !call.disputed) {
				return false;
			}
			if (filters.dispute === 'no' && call.disputed) {
				return false;
			}

			if (filters.result !== 'all' && call.result !== filters.result) {
				return false;
			}

			if (
				filters.evaluationTypes.length > 0 &&
				!filters.evaluationTypes.includes(call.evaluationType)
			) {
				return false;
			}

			return true;
		});
	}, [filters]);

	return (
		<ContentContainer>
			<Stack gap='lg'>
				<div>
					<Title order={2} mb='xs'>
						Your Evaluations
					</Title>
					<Text size='sm' c='dimmed'>
						Review all calls and their evaluations
					</Text>
				</div>

				<EvaluationFiltersBar
					filters={filters}
					onFiltersChange={setFilters}
					campaigns={uniqueCampaigns}
				/>

				<BaseTable
					data={filteredCalls}
					columns={columns}
					getRowId={(call) => call.id}
					density='compact'
					filterMode='client'
					onRowClick={(call) =>
						navigate(`/role-preview/agent-dashboard/evaluations/${call.id}`)
					}
				/>

				<Text size='sm' c='dimmed'>
					Showing {filteredCalls.length} of {DEMO_AGENT_CALLS.length}{' '}
					calls
				</Text>
			</Stack>
		</ContentContainer>
	);
};

export default AgentEvaluationsPage;
