import React from 'react';
import { useNavigate, useParams } from 'react-router';
import {
	Anchor,
	Breadcrumbs,
	Button,
	Grid,
	Stack,
	Tabs,
	Text,
} from '@mantine/core';
import {
	IconDownload,
	IconEdit,
	IconGitBranch,
	IconMicrophone,
} from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import EmptyState from '~/components/EmptyState';
import SectionCard from '~/components/SectionCard';
import { getDemoCampaign } from '../mockData';
import type { DemoCriteriaSection, DemoTranscriptTurn } from '../mockData';
import FinalScoreHero from '../components/FinalScoreHero';
import EvaluationTypeSelect from '../components/EvaluationTypeSelect';
import MockAudioPlayerBar from '../components/MockAudioPlayerBar';
import DemoTranscript from '../components/DemoTranscript';
import CriteriaCard from '../components/CriteriaCard';
import styles from './DemoResultCallDetailPage.module.css';

const SAMPLE_TRANSCRIPT: DemoTranscriptTurn[] = [
	{
		id: 't1',
		role: 'agent',
		timestamp: '0:00',
		text: 'Good morning! Thank you for calling. How can I help you today?',
	},
	{
		id: 't2',
		role: 'customer',
		timestamp: '0:07',
		text: 'Hi, I had a question about my recent order.',
	},
	{
		id: 't3',
		role: 'agent',
		timestamp: '0:14',
		text: 'Happy to help — let me pull that up for you.',
	},
];

const SAMPLE_CRITERIA: DemoCriteriaSection[] = [
	{
		id: 'greeting',
		name: 'Greeting Quality',
		score: 18,
		maxScore: 20,
		subCriteria: [
			{
				id: 'greeting-1',
				description: 'Agent greeted within 5 seconds',
				verdict: 'pass',
				points: 10,
				maxPoints: 10,
			},
			{
				id: 'greeting-2',
				description: 'Used customer name',
				verdict: 'pass',
				points: 8,
				maxPoints: 10,
			},
		],
	},
	{
		id: 'communication',
		name: 'Communication',
		score: 22,
		maxScore: 25,
		subCriteria: [
			{
				id: 'communication-1',
				description: 'Clear and professional tone',
				verdict: 'pass',
				points: 10,
				maxPoints: 10,
			},
			{
				id: 'communication-2',
				description: 'Active listening demonstrated',
				verdict: 'pass',
				points: 12,
				maxPoints: 15,
			},
		],
	},
];

const DemoResultCallDetailPage: React.FC = () => {
	const { campaignId, callId } = useParams<{
		campaignId: string;
		callId: string;
	}>();
	const navigate = useNavigate();

	const campaign = getDemoCampaign(campaignId);
	const call = campaign?.results.find((r) => r.id === callId);

	if (!campaign || !call) {
		return (
			<ContentContainer
				contentWidth='full'
				title='Call not found'
				showBackButton
				onBackClick={() => navigate('/role-preview/qa-campaigns')}
			>
				<EmptyState message='This call does not exist in the demo data.' />
			</ContentContainer>
		);
	}

	return (
		<ContentContainer
			contentWidth='full'
			title={
				<Breadcrumbs>
					<Anchor
						onClick={() => navigate('/role-preview/qa-campaigns')}
						size='sm'
					>
						Campaigns
					</Anchor>
					<Anchor
						onClick={() =>
							navigate(`/role-preview/qa-campaigns/${campaign.id}`)
						}
						size='sm'
					>
						{campaign.groupLabel}
					</Anchor>
					<Anchor component='span' size='sm' fw={600}>
						{call.fileName}
					</Anchor>
				</Breadcrumbs>
			}
			description='Evaluation results and transcript'
		>
			<Stack gap='md'>
				<EvaluationTypeSelect />

				<FinalScoreHero
					score={call.score ?? 0}
					pass={call.passed ? 'pass' : 'fail'}
				/>

				<Tabs defaultValue='general' color='green'>
					<div className={styles.tabsRow}>
						<Tabs.List>
							<Tabs.Tab value='general'>General</Tabs.Tab>
							<Tabs.Tab
								value='changeLog'
								leftSection={<IconGitBranch size={16} />}
							>
								Change Log
							</Tabs.Tab>
						</Tabs.List>
						<div style={{ display: 'flex', gap: 8 }}>
							<Button variant='default' leftSection={<IconEdit size={16} />}>
								Edit Evaluation
							</Button>
						</div>
					</div>

					<Tabs.Panel value='general' pt='md'>
						<Grid gap='md'>
							<Grid.Col span={{ base: 12, lg: 4 }}>
								<Stack gap='md'>
									<SectionCard>
										<div className={styles.callInfoRow}>
											<div className={styles.callInfoIcon}>
												<IconMicrophone size={20} />
											</div>
											<div>
												<Text fw={600}>{call.fileName}</Text>
												<Text size='xs' c='dimmed'>
													{call.date}
												</Text>
											</div>
										</div>
									</SectionCard>

									<MockAudioPlayerBar durationSeconds={180} />

									<SectionCard
										title={`Transcript · ${SAMPLE_TRANSCRIPT.length} turns`}
										headerActions={
											<Button
												variant='subtle'
												size='xs'
												leftSection={<IconDownload size={14} />}
											>
												Download
											</Button>
										}
									>
										<DemoTranscript turns={SAMPLE_TRANSCRIPT} />
									</SectionCard>
								</Stack>
							</Grid.Col>

							<Grid.Col span={{ base: 12, lg: 8 }}>
								<Stack gap='md'>
									{SAMPLE_CRITERIA.map((section) => (
										<CriteriaCard key={section.id} section={section} />
									))}
								</Stack>
							</Grid.Col>
						</Grid>
					</Tabs.Panel>

					<Tabs.Panel value='changeLog' pt='md'>
						<EmptyState message='Change log — demo not yet built.' />
					</Tabs.Panel>
				</Tabs>
			</Stack>
		</ContentContainer>
	);
};

export default DemoResultCallDetailPage;
