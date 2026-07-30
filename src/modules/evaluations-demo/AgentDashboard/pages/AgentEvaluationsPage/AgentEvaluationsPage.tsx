import React, { useMemo, useState } from 'react';
import { Stack, Title, Text, Group, Select } from '@mantine/core';
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
		startDate: null,
		endDate: null,
		scoreMin: 0,
		scoreMax: 100,
		dispute: 'all',
	});
	const [pageSize, setPageSize] = useState(10);

	const uniqueCampaigns = useMemo(
		() => [...new Set(DEMO_AGENT_CALLS.map((call) => call.campaign))],
		[]
	);

	const handleSearch = () => {
		// Filters are applied in real-time, button here is for UX
		// Could add analytics or other actions here
	};

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
					onSearch={handleSearch}
				/>

				<Group justify='space-between' align='center'>
					<Text size='sm' c='dimmed'>
						Showing {filteredCalls.length} of {DEMO_AGENT_CALLS.length} calls
					</Text>
					<Select
						placeholder='Results per page'
						data={[
							{ value: '5', label: '5' },
							{ value: '10', label: '10' },
							{ value: '25', label: '25' },
							{ value: '50', label: '50' },
						]}
						value={pageSize.toString()}
						onChange={(value) => setPageSize(value ? parseInt(value, 10) : 10)}
						w={120}
					/>
				</Group>

				<BaseTable
					data={filteredCalls}
					columns={columns}
					getRowId={(call) => call.id}
					density='compact'
					filterMode='client'
					enablePagination
					showPaginationControls
					pageSize={pageSize}
					onRowClick={(call) =>
						navigate(`/role-preview/agent-dashboard/evaluations/${call.id}`)
					}
				/>
			</Stack>
		</ContentContainer>
	);
};

export default AgentEvaluationsPage;
