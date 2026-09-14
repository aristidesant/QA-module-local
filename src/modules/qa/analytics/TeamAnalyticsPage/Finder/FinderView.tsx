import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge, Group, Stack, Table, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import styles from '../TeamAnalyticsPage.module.css';

interface FinderResult {
	agentId: string;
	agentName: string;
	metricKey: string;
	value: number;
	operator: 'BELOW' | 'ABOVE' | 'BETWEEN';
	threshold: string;
	calls: number;
	severity: 'warning' | 'danger' | 'info';
}

const FINDER_RESULTS: FinderResult[] = [
	{
		agentId: 'AG-001',
		agentName: 'Agent Smith',
		metricKey: 'QA_OVERALL_SCORE',
		value: 68,
		operator: 'BELOW',
		threshold: '75',
		calls: 142,
		severity: 'warning',
	},
	{
		agentId: 'AG-002',
		agentName: 'Agent Johnson',
		metricKey: 'CUSTOMER_SENTIMENT_SCORE',
		value: 3.1,
		operator: 'BELOW',
		threshold: '3.5',
		calls: 128,
		severity: 'warning',
	},
	{
		agentId: 'AG-003',
		agentName: 'Agent Williams',
		metricKey: 'NEGATIVE_EMOTION_CALL_SHARE',
		value: 45,
		operator: 'ABOVE',
		threshold: '30',
		calls: 156,
		severity: 'danger',
	},
	{
		agentId: 'AG-004',
		agentName: 'Agent Brown',
		metricKey: 'COMPLIANCE_OVERALL_SCORE',
		value: 72,
		operator: 'BETWEEN',
		threshold: '70 – 85',
		calls: 98,
		severity: 'info',
	},
];

const SEVERITY_COLOR: Record<FinderResult['severity'], string> = {
	danger: 'red',
	warning: 'yellow',
	info: 'blue',
};

const FinderView = () => {
	const { t } = useTranslation('qa.teamAnalytics');
	const [search, setSearch] = useState('');

	const term = search.trim().toLowerCase();
	const results = term
		? FINDER_RESULTS.filter((r) => r.agentName.toLowerCase().includes(term))
		: FINDER_RESULTS;

	const rows = results.map((result) => (
		<Table.Tr key={result.agentId}>
			<Table.Td>
				<Text fw={500} size='sm'>
					{result.agentName}
				</Text>
			</Table.Td>
			<Table.Td>
				<Text size='sm'>{t(`metrics.${result.metricKey}`)}</Text>
			</Table.Td>
			<Table.Td align='right'>
				<Group gap='xs' justify='flex-end'>
					<Text fw={700} size='sm'>
						{result.value.toFixed(1)}
					</Text>
					<Badge
						size='sm'
						variant='light'
						color={SEVERITY_COLOR[result.severity]}
					>
						{t(`finder.operators.${result.operator}`)} {result.threshold}
					</Badge>
				</Group>
			</Table.Td>
			<Table.Td align='right'>
				<Text size='sm' c='dimmed'>
					{result.calls}
				</Text>
			</Table.Td>
		</Table.Tr>
	));

	return (
		<Stack gap='md'>
			<div>
				<Text fw={600} size='sm'>
					{t('finder.title')}
				</Text>
				<Text size='sm' c='dimmed'>
					{t('finder.description')}
				</Text>
			</div>

			<TextInput
				label={t('finder.columns.agent')}
				description={t('finder.liveHint')}
				leftSection={<IconSearch size={16} />}
				value={search}
				onChange={(e) => setSearch(e.currentTarget.value)}
			/>

			{results.length === 0 ? (
				<Stack gap={4} py='xl' align='center'>
					<Text fw={500} size='sm'>
						{t('finder.empty')}
					</Text>
					<Text size='sm' c='dimmed'>
						{t('finder.emptyDescription')}
					</Text>
				</Stack>
			) : (
				<>
					<div className={styles.tableSurface}>
						<Table striped highlightOnHover verticalSpacing='sm' miw={640}>
							<Table.Thead>
								<Table.Tr>
									<Table.Th>{t('finder.columns.agent')}</Table.Th>
									<Table.Th>{t('finder.fields.metric')}</Table.Th>
									<Table.Th align='right'>{t('finder.columns.value')}</Table.Th>
									<Table.Th align='right'>{t('finder.columns.calls')}</Table.Th>
								</Table.Tr>
							</Table.Thead>
							<Table.Tbody>{rows}</Table.Tbody>
						</Table>
					</div>

					<Text size='sm' c='dimmed'>
						{t('finder.summary', { count: results.length })}
					</Text>
				</>
			)}
		</Stack>
	);
};

export default FinderView;
