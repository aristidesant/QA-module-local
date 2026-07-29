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
	IconMessageCircle,
} from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import EmptyState from '~/components/EmptyState';
import SectionCard from '~/components/SectionCard';
import { getDemoCall, getDemoCampaign, getDemoEvaluation } from '../mockData';
import FinalScoreHero from '../components/FinalScoreHero';
import EvaluationTypeSelect from '../components/EvaluationTypeSelect';
import MockAudioPlayerBar from '../components/MockAudioPlayerBar';
import DemoTranscript from '../components/DemoTranscript';
import CriteriaCard from '../components/CriteriaCard';
import styles from './DemoCallDetailPage.module.css';

const DemoCallDetailPage: React.FC = () => {
	const { campaignId, evaluationId, callId } = useParams<{
		campaignId: string;
		evaluationId: string;
		callId: string;
	}>();
	const navigate = useNavigate();

	const campaign = getDemoCampaign(campaignId);
	const evaluation = getDemoEvaluation(campaignId, evaluationId);
	const call = getDemoCall(campaignId, evaluationId, callId);

	if (!campaign || !evaluation || !call) {
		return (
			<ContentContainer
				contentWidth='full'
				title='Call not found'
				showBackButton
				onBackClick={() => navigate('/evaluations-demo')}
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
					<Anchor onClick={() => navigate('/evaluations-demo')} size='sm'>
						Campaigns
					</Anchor>
					<Anchor
						onClick={() => navigate(`/evaluations-demo/${campaign.id}`)}
						size='sm'
					>
						{campaign.groupLabel}
					</Anchor>
					<Anchor
						onClick={() =>
							navigate(`/evaluations-demo/${campaign.id}/${evaluation.id}`)
						}
						size='sm'
					>
						{evaluation.title}
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

				<FinalScoreHero score={call.score ?? 0} pass={call.pass} />

				<Tabs defaultValue='general' color='green'>
					<div className={styles.tabsRow}>
						<Tabs.List>
							<Tabs.Tab value='general'>General</Tabs.Tab>
							<Tabs.Tab value='changeLog' leftSection={<IconGitBranch size={16} />}>
								Change Log
							</Tabs.Tab>
						</Tabs.List>
						<div style={{ display: 'flex', gap: 8 }}>
							<Button variant='default' leftSection={<IconEdit size={16} />}>
								Edit Evaluation
							</Button>
							<Button color='green' leftSection={<IconMessageCircle size={16} />}>
								Submit Dispute
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
												<Text fw={600}>{call.agentName}</Text>
												<Text size='xs' c='dimmed'>
													{call.date} · {call.durationLabel}
												</Text>
											</div>
										</div>
									</SectionCard>

									<MockAudioPlayerBar durationSeconds={call.durationSeconds} />

									<SectionCard
										title={`Transcript · ${call.transcript.length} turns`}
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
										<DemoTranscript turns={call.transcript} />
									</SectionCard>
								</Stack>
							</Grid.Col>

							<Grid.Col span={{ base: 12, lg: 8 }}>
								<Stack gap='md'>
									{call.criteria.map((section) => (
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

export default DemoCallDetailPage;
