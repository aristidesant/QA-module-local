import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { notifications } from '@mantine/notifications';
import {
	Tabs,
	Grid,
	Stack,
	Button,
	Group,
	Drawer,
	Textarea,
	Text,
} from '@mantine/core';
import {
	IconMessageCircle,
	IconGitBranch,
	IconDownload,
	IconMicrophone,
} from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import { DEMO_AGENT_CALLS } from '../../mockData';
import FinalScoreHero from '../../../components/FinalScoreHero';
import EvaluationTypeSelect from '../../../components/EvaluationTypeSelect';
import MockAudioPlayerBar from '../../../components/MockAudioPlayerBar';
import DemoTranscript from '../../../components/DemoTranscript';
import CriteriaCard from '../../../components/CriteriaCard';
import styles from './AgentEvaluationDetailPage.module.css';

const AgentEvaluationDetailPage: React.FC = () => {
	const { callId } = useParams();
	const navigate = useNavigate();
	const [disputeDrawerOpened, setDisputeDrawerOpened] = useState(false);
	const [comments, setComments] = useState('');

	const call = useMemo(
		() => DEMO_AGENT_CALLS.find((c) => c.id === callId),
		[callId]
	);

	if (!call) {
		return (
			<ContentContainer
				contentWidth='full'
				title='Call not found'
				showBackButton
				onBackClick={() => navigate(-1)}
			>
				<div>Call not found</div>
			</ContentContainer>
		);
	}

	const transcriptTurns = call.transcript.map((turn, idx) => ({
		id: `turn-${idx}`,
		role: turn.speaker as 'agent' | 'customer',
		timestamp: `${Math.floor(turn.timestamp / 60)}:${String(turn.timestamp % 60).padStart(2, '0')}`,
		text: turn.text,
	}));

	const extensiveMockEvaluation = [
		{
			id: 'greeting',
			name: 'Greeting Quality',
			score: 18,
			maxScore: 20,
			subCriteria: [
				{
					id: 'greeting-1',
					description: 'Agent greeted within 5 seconds',
					verdict: 'pass' as const,
					points: 10,
					maxPoints: 10,
				},
				{
					id: 'greeting-2',
					description: 'Used customer name',
					verdict: 'pass' as const,
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
					verdict: 'pass' as const,
					points: 10,
					maxPoints: 10,
				},
				{
					id: 'communication-2',
					description: 'Active listening demonstrated',
					verdict: 'pass' as const,
					points: 12,
					maxPoints: 15,
				},
			],
		},
		{
			id: 'problem-resolution',
			name: 'Problem Resolution',
			score: 19,
			maxScore: 25,
			subCriteria: [
				{
					id: 'resolution-1',
					description: 'Understood customer issue clearly',
					verdict: 'pass' as const,
					points: 10,
					maxPoints: 10,
				},
				{
					id: 'resolution-2',
					description: 'Provided effective solution',
					verdict: 'pass' as const,
					points: 9,
					maxPoints: 15,
				},
			],
		},
		{
			id: 'compliance',
			name: 'Compliance & Policies',
			score: 20,
			maxScore: 20,
			subCriteria: [
				{
					id: 'compliance-1',
					description: 'Followed company policies',
					verdict: 'pass' as const,
					points: 10,
					maxPoints: 10,
				},
				{
					id: 'compliance-2',
					description: 'Security protocols observed',
					verdict: 'pass' as const,
					points: 10,
					maxPoints: 10,
				},
			],
		},
	];

	const criteriaSections =
		call.evaluationDetails.length > 0
			? call.evaluationDetails.map((section) => ({
					id: section.section.toLowerCase().replace(/\s+/g, '-'),
					name: section.section,
					score: section.items.reduce((sum, item) => sum + item.score, 0),
					maxScore: section.items.reduce(
						(sum, item) => sum + item.maxPoints,
						0
					),
					subCriteria: section.items.map((item) => ({
						id: item.name.toLowerCase().replace(/\s+/g, '-'),
						description: item.name,
						verdict: (item.score === item.maxPoints ? 'pass' : 'fail') as
							| 'pass'
							| 'fail',
						points: item.score,
						maxPoints: item.maxPoints,
					})),
				}))
			: extensiveMockEvaluation;

	return (
		<ContentContainer
			contentWidth='full'
			showBackButton
			onBackClick={() => navigate(-1)}
		>
			<Stack gap='md'>
				<EvaluationTypeSelect />

				<FinalScoreHero
					score={call.score}
					pass={call.result === 'passed' ? 'pass' : 'fail'}
				/>

				<Tabs defaultValue='general' color='green'>
					<div className={styles.tabsRow}>
						<Tabs.List>
							<Tabs.Tab value='general'>General</Tabs.Tab>
							<Tabs.Tab
								value='changeLog'
								leftSection={<IconGitBranch size={16} />}
							>
								Disputes
							</Tabs.Tab>
						</Tabs.List>
						<Group ml='auto' gap='sm'>
							<Button
								leftSection={<IconMessageCircle size={16} />}
								onClick={() => setDisputeDrawerOpened(true)}
							>
								Create Dispute
							</Button>
						</Group>
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
												<div style={{ fontWeight: 600 }}>{call.campaign}</div>
												<div
													style={{
														fontSize: 'var(--mantine-font-size-xs)',
														color: 'var(--mantine-color-gray-6)',
													}}
												>
													{new Date(call.callDate).toLocaleDateString('en-US', {
														year: 'numeric',
														month: 'short',
														day: 'numeric',
														hour: '2-digit',
														minute: '2-digit',
													})}
												</div>
											</div>
										</div>
									</SectionCard>

									<MockAudioPlayerBar durationSeconds={call.durationSeconds} />

									<SectionCard
										title={`Transcript · ${transcriptTurns.length} turns`}
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
										<DemoTranscript turns={transcriptTurns} />
									</SectionCard>
								</Stack>
							</Grid.Col>

							<Grid.Col span={{ base: 12, lg: 8 }}>
								<Stack gap='md'>
									{criteriaSections.map((section) => (
										<CriteriaCard
											key={section.id}
											section={section}
											showCheckboxes={false}
										/>
									))}
								</Stack>
							</Grid.Col>
						</Grid>
					</Tabs.Panel>

					<Tabs.Panel value='changeLog' pt='md'>
						<div>Change log — demo not yet built.</div>
					</Tabs.Panel>
				</Tabs>
			</Stack>

			<Drawer
				opened={disputeDrawerOpened}
				onClose={() => {
					setDisputeDrawerOpened(false);
					setComments('');
				}}
				title='Submit Dispute'
				position='right'
				size='md'
			>
				<Stack gap='md' h='100%' justify='space-between'>
					<Stack gap='md'>
						<Text size='sm' c='dimmed'>
							Please provide a comment explaining your dispute:
						</Text>
						<Textarea
							label='Dispute Comment'
							placeholder='Explain why you are disputing this evaluation...'
							minRows={6}
							value={comments}
							onChange={(e) => setComments(e.currentTarget.value)}
							autoFocus
						/>
					</Stack>

					<Group justify='flex-end' gap='sm'>
						<Button
							variant='light'
							onClick={() => {
								setDisputeDrawerOpened(false);
								setComments('');
							}}
						>
							Cancel
						</Button>
						<Button
							disabled={!comments.trim()}
							onClick={() => {
								// Handle dispute submission
								console.log('Dispute submitted with comment:', comments);
								notifications.show({
									title: 'Dispute Submitted',
									message: 'Your dispute has been submitted successfully.',
									color: 'green',
									position: 'top-right',
									autoClose: 3000,
								});
								setDisputeDrawerOpened(false);
								setComments('');
							}}
						>
							Submit Dispute
						</Button>
					</Group>
				</Stack>
			</Drawer>
		</ContentContainer>
	);
};

export default AgentEvaluationDetailPage;
