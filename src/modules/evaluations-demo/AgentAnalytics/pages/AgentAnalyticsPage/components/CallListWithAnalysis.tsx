import React, { useMemo, useState } from 'react';
import {
	Card,
	Stack,
	Text,
	TextInput,
	Group,
	Chip,
	Table,
	Badge,
	Pagination,
	Center,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { AnalysisCall, AnalysisType } from '../../../types/analyticsTypes';

interface CallListWithAnalysisProps {
	analysis: AnalysisType;
	calls: AnalysisCall[];
	onCallClick?: (call: AnalysisCall) => void;
}

const ITEMS_PER_PAGE = 10;

const CallListWithAnalysis: React.FC<CallListWithAnalysisProps> = ({
	analysis,
	calls,
	onCallClick,
}) => {
	const [searchQuery, setSearchQuery] = useState('');
	const [activePage, setActivePage] = useState(1);
	const [statusFilter, setStatusFilter] = useState<string | null>(null);

	const filteredCalls = useMemo(() => {
		let result = calls;

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(call) =>
					call.id.toLowerCase().includes(query) ||
					call.agentName.toLowerCase().includes(query)
			);
		}

		if (statusFilter) {
			if (analysis === 'qa') {
				result = result.filter((call) => call.qaStatus === statusFilter);
			} else if (analysis === 'compliance') {
				result = result.filter(
					(call) => call.complianceStatus === statusFilter
				);
			}
		}

		return result;
	}, [calls, searchQuery, statusFilter, analysis]);

	const paginatedCalls = useMemo(() => {
		const start = (activePage - 1) * ITEMS_PER_PAGE;
		return filteredCalls.slice(start, start + ITEMS_PER_PAGE);
	}, [filteredCalls, activePage]);

	const totalPages = Math.ceil(filteredCalls.length / ITEMS_PER_PAGE);

	const renderQARow = (call: AnalysisCall) => (
		<Table.Tr
			key={call.id}
			onClick={() => onCallClick?.(call)}
			// inline-style-allow: cursor pointer for clickable row
			style={{ cursor: 'pointer' }}
		>
			<Table.Td fw={500}>{call.id}</Table.Td>
			<Table.Td>{call.date.toLocaleDateString()}</Table.Td>
			<Table.Td>{Math.round(call.duration / 60)} min</Table.Td>
			<Table.Td fw={600}>{call.qaScore}</Table.Td>
			<Table.Td>
				<Badge
					color={call.qaStatus === 'pass' ? 'green' : 'red'}
					variant='light'
				>
					{call.qaStatus?.toUpperCase()}
				</Badge>
			</Table.Td>
			<Table.Td>{call.qaCategory}</Table.Td>
		</Table.Tr>
	);

	const renderEmotionRow = (call: AnalysisCall) => (
		<Table.Tr
			key={call.id}
			onClick={() => onCallClick?.(call)}
			// inline-style-allow: cursor pointer for clickable row
			style={{ cursor: 'pointer' }}
		>
			<Table.Td fw={500}>{call.id}</Table.Td>
			<Table.Td>{call.date.toLocaleDateString()}</Table.Td>
			<Table.Td>{call.agentEmotion}</Table.Td>
			<Table.Td>{call.customerEmotion}</Table.Td>
			<Table.Td fw={600}>{call.sentimentScore?.toFixed(2)}</Table.Td>
			<Table.Td>{call.tone}</Table.Td>
		</Table.Tr>
	);

	const renderComplianceRow = (call: AnalysisCall) => (
		<Table.Tr
			key={call.id}
			onClick={() => onCallClick?.(call)}
			// inline-style-allow: cursor pointer for clickable row
			style={{ cursor: 'pointer' }}
		>
			<Table.Td fw={500}>{call.id}</Table.Td>
			<Table.Td>{call.date.toLocaleDateString()}</Table.Td>
			<Table.Td>{call.violationsFound}</Table.Td>
			<Table.Td>
				<Badge
					color={
						call.complianceSeverity === 'critical'
							? 'red'
							: call.complianceSeverity === 'high'
								? 'orange'
								: 'yellow'
					}
					variant='light'
				>
					{call.complianceSeverity}
				</Badge>
			</Table.Td>
			<Table.Td>{call.violationType}</Table.Td>
			<Table.Td>
				<Badge
					color={call.complianceStatus === 'compliant' ? 'green' : 'red'}
					variant='light'
				>
					{call.complianceStatus}
				</Badge>
			</Table.Td>
		</Table.Tr>
	);

	const renderBehavioralRow = (call: AnalysisCall) => (
		<Table.Tr
			key={call.id}
			onClick={() => onCallClick?.(call)}
			// inline-style-allow: cursor pointer for clickable row
			style={{ cursor: 'pointer' }}
		>
			<Table.Td fw={500}>{call.id}</Table.Td>
			<Table.Td>{call.date.toLocaleDateString()}</Table.Td>
			<Table.Td>{call.engagementLevel}</Table.Td>
			<Table.Td>{call.responseTime}s</Table.Td>
			<Table.Td fw={600}>{call.handlingQuality}</Table.Td>
			<Table.Td>{call.customerSatisfaction}/5</Table.Td>
		</Table.Tr>
	);

	const getRowRenderer = () => {
		switch (analysis) {
			case 'qa':
				return renderQARow;
			case 'emotion':
				return renderEmotionRow;
			case 'compliance':
				return renderComplianceRow;
			case 'behavioral':
				return renderBehavioralRow;
			default:
				return renderQARow;
		}
	};

	const getTableHeaders = () => {
		switch (analysis) {
			case 'qa':
				return [
					'Call ID',
					'Date',
					'Duration',
					'Score',
					'Status',
					'Category',
				];
			case 'emotion':
				return [
					'Call ID',
					'Date',
					'Agent Emotion',
					'Customer Emotion',
					'Sentiment',
					'Tone',
				];
			case 'compliance':
				return ['Call ID', 'Date', 'Violations', 'Severity', 'Type', 'Status'];
			case 'behavioral':
				return [
					'Call ID',
					'Date',
					'Engagement',
					'Response Time',
					'Quality',
					'Satisfaction',
				];
			default:
				return [];
		}
	};

	const renderRow = getRowRenderer();
	const headers = getTableHeaders();

	return (
		<Card withBorder radius='md' shadow='sm'>
			<Card.Section withBorder inheritPadding py='md'>
				<Stack gap='md'>
					<Text fw={600} size='sm'>
						Call Details
					</Text>

					<TextInput
						placeholder='Search by Call ID or Agent Name'
						leftSection={<IconSearch size={16} />}
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery(e.currentTarget.value);
							setActivePage(1);
						}}
					/>

					{(analysis === 'qa' || analysis === 'compliance') && (
						<Group>
							<Text size='sm' fw={500}>
								Filter:
							</Text>
							<Chip.Group
								value={statusFilter}
								onChange={setStatusFilter}
								multiple={false}
							>
								{analysis === 'qa' ? (
									<>
										<Chip value='pass' variant='light'>
											Pass
										</Chip>
										<Chip value='fail' variant='light'>
											Fail
										</Chip>
									</>
								) : (
									<>
										<Chip value='compliant' variant='light'>
											Compliant
										</Chip>
										<Chip value='violation' variant='light'>
											Violation
										</Chip>
									</>
								)}
							</Chip.Group>
						</Group>
					)}
				</Stack>
			</Card.Section>

			<Card.Section>
				{paginatedCalls.length === 0 ? (
					<Center py='xl'>
						<Text c='dimmed'>No calls found</Text>
					</Center>
				) : (
					<Table striped highlightOnHover>
						<Table.Thead>
							<Table.Tr>
								{headers.map((header) => (
									<Table.Th key={header}>{header}</Table.Th>
								))}
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>{paginatedCalls.map(renderRow)}</Table.Tbody>
					</Table>
				)}
			</Card.Section>

			{totalPages > 1 && (
				<Card.Section withBorder inheritPadding py='md'>
					<Center>
						<Pagination
							value={activePage}
							onChange={setActivePage}
							total={totalPages}
						/>
					</Center>
				</Card.Section>
			)}
		</Card>
	);
};

export default CallListWithAnalysis;
