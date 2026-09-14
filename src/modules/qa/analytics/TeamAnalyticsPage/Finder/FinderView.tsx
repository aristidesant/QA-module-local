import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Stack,
	TextInput,
	Button,
	Group,
	Table,
	Badge,
	Text,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

interface FinderResult {
	agentId: string;
	agentName: string;
	metric: string;
	value: number;
	threshold: string;
	status: 'warning' | 'danger' | 'info';
}

const FinderView = () => {
	const { t } = useTranslation('qa.teamAnalytics');
	const [searchQuery, setSearchQuery] = useState('');

	const sampleResults: FinderResult[] = [
		{
			agentId: 'AG-001',
			agentName: 'Agent Smith',
			metric: 'QA Score',
			value: 68,
			threshold: 'Below 75',
			status: 'warning',
		},
		{
			agentId: 'AG-002',
			agentName: 'Agent Johnson',
			metric: 'Sentiment',
			value: 3.1,
			threshold: 'Below 3.5',
			status: 'warning',
		},
		{
			agentId: 'AG-003',
			agentName: 'Agent Williams',
			metric: 'Negative Emotion',
			value: 45,
			threshold: 'Above 30%',
			status: 'danger',
		},
		{
			agentId: 'AG-004',
			agentName: 'Agent Brown',
			metric: 'Compliance',
			value: 72,
			threshold: 'Between 70-85',
			status: 'info',
		},
	];

	const rows = sampleResults.map((result) => (
		<Table.Tr key={result.agentId}>
			<Table.Td>
				<Text fw={500}>{result.agentName}</Text>
			</Table.Td>
			<Table.Td>{result.metric}</Table.Td>
			<Table.Td>
				<Text fw={700}>{result.value.toFixed(1)}</Text>
			</Table.Td>
			<Table.Td>{result.threshold}</Table.Td>
			<Table.Td>
				<Badge
					size='sm'
					variant='light'
					color={
						result.status === 'danger'
							? 'red'
							: result.status === 'warning'
								? 'yellow'
								: 'blue'
					}
				>
					{result.status}
				</Badge>
			</Table.Td>
		</Table.Tr>
	));

	return (
		<Stack gap='lg'>
			<Group>
				<TextInput
					placeholder={t('finder.searchPlaceholder')}
					leftSection={<IconSearch size={16} />}
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.currentTarget.value)}
					flex={1}
				/>
				<Button>{t('finder.search')}</Button>
			</Group>

			<Table striped highlightOnHover>
				<Table.Thead>
					<Table.Tr>
						<Table.Th>{t('finder.agent')}</Table.Th>
						<Table.Th>{t('finder.metric')}</Table.Th>
						<Table.Th>{t('finder.value')}</Table.Th>
						<Table.Th>{t('finder.criteria')}</Table.Th>
						<Table.Th>{t('finder.status')}</Table.Th>
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>{rows}</Table.Tbody>
			</Table>

			<Text size='sm' c='dimmed'>
				{sampleResults.length} {t('finder.resultsFound')}
			</Text>
		</Stack>
	);
};

export default FinderView;
