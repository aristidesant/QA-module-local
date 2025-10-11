import { useState } from 'react';
import { useParams } from 'react-router';
import {
	Stack,
	SimpleGrid,
	Select,
	Flex,
	Text,
	Loader,
	Alert,
} from '@mantine/core';
import { IconEye, IconAlertCircle } from '@tabler/icons-react';
import { ContentContainer } from '~/components/ContentContainer';
import { SectionCard } from '~/components/SectionCard';
import { StatCard } from '~/components/StatCard';
import { MetricGrid } from './components/MetricGrid';
import { MetricInfoCard } from './components/MetricInfoCard';
import {
	ActiveCallsTable,
	type ActiveCall,
} from './components/ActiveCallsTable';
import {
	AgentStatusLegend,
	type LegendItem,
} from './components/AgentStatusLegend';
import { MiniSparkline } from './components/MiniSparkline';
import { useGetCampaign } from '~/queries/campaignsQueries';
import styles from './CampaignLiveMetricPage.module.css';

// Mock data - replace with actual data from API
const mockSparklineData = [45, 52, 48, 58, 53, 60, 55, 58];

const mockActiveCalls: ActiveCall[] = [
	{
		station: 'SIP/1580',
		user: 'Yari Esthe...',
		sessionId: '860064',
		status: 'INCALL',
		pause: '',
		mmss: '1:25',
		campaign: 'P734_C',
		calls: 72,
		hold: '',
		inGroup: '',
	},
	{
		station: 'SIP/1580',
		user: 'Yari Esthe...',
		sessionId: '860064',
		status: 'INCALL',
		pause: '',
		mmss: '1:25',
		campaign: 'P734_C',
		calls: 72,
		hold: '',
		inGroup: '',
	},
	{
		station: 'SIP/1580',
		user: 'Yari Esthe...',
		sessionId: '860064',
		status: 'INCALL',
		pause: '',
		mmss: '1:25',
		campaign: 'P734_C',
		calls: 72,
		hold: '',
		inGroup: '',
	},
	{
		station: 'SIP/1580',
		user: 'Yari Esthe...',
		sessionId: '860064',
		status: 'INCALL',
		pause: '',
		mmss: '1:25',
		campaign: 'P734_C',
		calls: 72,
		hold: '',
		inGroup: '',
	},
	{
		station: 'SIP/1580',
		user: 'Yari Esthe...',
		sessionId: '860064',
		status: 'INCALL',
		pause: '',
		mmss: '1:25',
		campaign: 'P734_C',
		calls: 72,
		hold: '',
		inGroup: '',
	},
	{
		station: 'SIP/1580',
		user: 'Yari Esthe...',
		sessionId: '860064',
		status: 'INCALL',
		pause: '',
		mmss: '1:25',
		campaign: 'P734_C',
		calls: 72,
		hold: '',
		inGroup: '',
	},
	{
		station: 'SIP/1580',
		user: 'Yari Esthe...',
		sessionId: '860064',
		status: 'INCALL',
		pause: '',
		mmss: '1:25',
		campaign: 'P734_C',
		calls: 72,
		hold: '',
		inGroup: '',
	},
];

const agentStatusLegend: LegendItem[] = [
	{ label: 'Agent waiting for call', color: 'var(--mantine-color-gray-4)' },
	{
		label: 'Agent waiting for call > 1 minute',
		color: 'var(--mantine-color-blue-2)',
	},
	{
		label: 'Agent waiting for call > 5 minutes',
		color: 'var(--mantine-color-blue-4)',
	},
	{ label: 'Agent on call < 10 seconds', color: 'var(--mantine-color-red-2)' },
	{ label: 'Agent on call > 1 minute', color: 'var(--mantine-color-red-4)' },
	{ label: 'Agent on call > 5 minutes', color: 'var(--mantine-color-red-6)' },
	{ label: 'Agent Paused > 10 seconds', color: 'var(--mantine-color-gray-5)' },
	{ label: 'Agent Paused > 1 minute', color: 'var(--mantine-color-gray-6)' },
	{ label: 'Agent Paused > 5 minutes', color: 'var(--mantine-color-gray-7)' },
	{
		label: 'Agent in 3-Way > 10 seconds',
		color: 'var(--mantine-color-yellow-5)',
	},
	{ label: 'Agent on a dead call', color: 'var(--mantine-color-dark-6)' },
];

// TODO: Connect to real data and implement filtering/sorting
export const CampaignLiveMetricPage = () => {
	const { campaignId } = useParams<{ campaignId: string }>();
	const [selectedDate] = useState<Date | null>(new Date());
	const [viewAllStatus, setViewAllStatus] = useState('all');

	// Fetch campaign data
	const {
		data: campaign,
		isLoading,
		isError,
		error,
	} = useGetCampaign(campaignId || '');

	// Loading state
	if (isLoading) {
		return (
			<ContentContainer
				title='Loading Campaign...'
				description='Please wait while we fetch the campaign details.'
			>
				<Flex justify='center' align='center' style={{ minHeight: '400px' }}>
					<Loader size='lg' />
				</Flex>
			</ContentContainer>
		);
	}

	// Error state
	if (isError || !campaign) {
		return (
			<ContentContainer
				title='Error Loading Campaign'
				description='Unable to load campaign details.'
			>
				<Alert
					icon={<IconAlertCircle size={16} />}
					title='Error'
					color='red'
					variant='light'
				>
					{error instanceof Error
						? error.message
						: 'Campaign not found or failed to load.'}
				</Alert>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer
			title={campaign.name || 'Campaign Metrics'}
			description={
				campaign.description ||
				'Quick snapshot of your AI operations, campaign performance, and real-time engagement metrics — all in one place.'
			}
			titleRight={
				<Flex gap='sm' align='center'>
					<Text size='sm' c='dimmed'>
						Date:
					</Text>
					<Text size='sm' fw={500}>
						{selectedDate?.toLocaleDateString() || 'Select date'}
					</Text>
					<Select
						placeholder='View all status'
						value={viewAllStatus}
						onChange={(value) => setViewAllStatus(value || 'all')}
						data={[
							{ value: 'all', label: 'View all status' },
							{ value: 'active', label: 'Active only' },
							{ value: 'paused', label: 'Paused only' },
						]}
						leftSection={<IconEye size={16} />}
						className={styles.statusSelect}
					/>
				</Flex>
			}
		>
			<Stack gap='lg' className={styles.container}>
				{/* Top Metrics */}
				<MetricGrid>
					<StatCard
						title='Dropped percent'
						value='0.08%'
						subtitle='Calls dropped before an agent answers.'
						chart={
							<MiniSparkline
								data={mockSparklineData}
								color='var(--mantine-color-green-6)'
							/>
						}
					/>
					<StatCard
						title='Calls today'
						value='1496'
						subtitle='Total calls handled today.'
						chart={
							<MiniSparkline
								data={mockSparklineData}
								color='var(--mantine-color-blue-6)'
							/>
						}
					/>
					<StatCard
						title='Dropped/Answered'
						value='1/1298'
						subtitle='The number of times an agent or system attempts to call a contact.'
						chart={
							<MiniSparkline
								data={mockSparklineData}
								color='var(--mantine-color-cyan-6)'
							/>
						}
					/>
				</MetricGrid>

				{/* Campaign Metrics Section */}
				<SectionCard title='Campaign Metrics'>
					<SimpleGrid cols={{ base: 2, sm: 3, md: 5 }} spacing='md'>
						<MetricInfoCard
							label='Current active calls'
							value='1'
							tooltip='Number of calls currently active'
						/>
						<MetricInfoCard
							label='Calls waiting for agents'
							value='0'
							tooltip='Calls in queue waiting for available agents'
						/>
						<MetricInfoCard
							label='Agents logged in'
							value='26'
							tooltip='Total agents currently logged in'
						/>
						<MetricInfoCard
							label='Agents waiting'
							value='0'
							tooltip='Agents waiting for calls'
						/>
						<MetricInfoCard
							label='Agents in dead calls'
							value='0'
							tooltip='Agents on calls with no activity'
						/>
						<MetricInfoCard
							label='Calls ringing'
							value='0'
							tooltip='Calls currently ringing'
						/>
						<MetricInfoCard
							label='Calls in IVR'
							value='0'
							tooltip='Calls in Interactive Voice Response system'
						/>
						<MetricInfoCard
							label='Agents in call'
							value='14'
							tooltip='Agents actively on calls'
						/>
						<MetricInfoCard
							label='Paused agents'
							value='0'
							tooltip='Agents currently paused'
						/>
						<MetricInfoCard
							label='Agents in dispo'
							value='12'
							tooltip='Agents in disposition mode'
						/>
					</SimpleGrid>
				</SectionCard>

				{/* Active Calls Table */}
				<SectionCard
					title='Active Calls'
					headerActions={
						<Text size='sm' c='dimmed'>
							26 agents logged in on all servers.
						</Text>
					}
				>
					<Stack gap='md'>
						<ActiveCallsTable calls={mockActiveCalls} />
						<AgentStatusLegend items={agentStatusLegend} />
					</Stack>
				</SectionCard>

				{/* Lead Metrics Section */}
				<SectionCard title='Lead Metrics'>
					<SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing='md'>
						<MetricInfoCard
							label='Dialable leads'
							value='106'
							tooltip='Number of leads available to dial'
						/>
						<MetricInfoCard
							label='Hopper (min/def)'
							value='100/0'
							tooltip='Minimum and default hopper settings'
						/>
						<MetricInfoCard
							label='Trunk short/fill'
							value='/0'
							tooltip='Trunk shortage and fill metrics'
						/>
						<MetricInfoCard
							label='Filter'
							value='COBROSP'
							tooltip='Current filter applied'
						/>
						<MetricInfoCard
							label='NA'
							value='2'
							tooltip='Not available count'
						/>
						<MetricInfoCard
							label='Leads in Hoper'
							value='104'
							tooltip='Total leads in hopper'
						/>
						<MetricInfoCard
							label='Dial level'
							value='1.000'
							tooltip='Current dialing level'
						/>
						<MetricInfoCard
							label='Avg Agents'
							value='0.00'
							tooltip='Average number of agents'
						/>
						<MetricInfoCard
							label='DL Diff'
							value='0.00'
							tooltip='Dial level difference'
						/>
						<MetricInfoCard
							label='Order'
							value='0.00%'
							tooltip='Order percentage'
						/>
						<MetricInfoCard
							label='Dial method'
							value='Inbound_man'
							tooltip='Current dialing method'
						/>
						<MetricInfoCard
							label='Up Rank'
							value='Up Rank'
							tooltip='Ranking status'
						/>
					</SimpleGrid>
				</SectionCard>
			</Stack>
		</ContentContainer>
	);
};

export default CampaignLiveMetricPage;
