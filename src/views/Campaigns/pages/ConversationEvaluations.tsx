import {
	ActionIcon,
	Anchor,
	Badge,
	Breadcrumbs,
	Button,
	Card,
	Grid,
	Group,
	Menu,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer';
import {
	IconArrowLeft,
	IconBook,
	IconCalendarEvent,
	IconChevronDown,
	IconSchool,
} from '@tabler/icons-react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import type { CallDetailTab, CallMoment, TranscriptTurn } from '../types';
import type { DisputeEvaluationType } from '~/models/qa/disputeCases';
import {
	CALL_EVALUATION_TABS,
	ESG_TAB,
	mockCampaignNames,
	mockCallEvaluationDetail,
} from '../constants';
import { QAEvaluationPanel } from '../components/call-evaluation/QAEvaluationPanel';
import { SentimentEmotionPanel } from '../components/call-evaluation/SentimentEmotionPanel';
import { CompliancePanel } from '../components/call-evaluation/CompliancePanel';
import { EsgPanel } from '../components/call-evaluation/EsgPanel';
import { BusinessInsightsPanel } from '../components/call-evaluation/BusinessInsightsPanel';
import { formatDuration } from '../components/call-evaluation/scoreColor';
import { CallPlayer } from '../components/call-evaluation/CallPlayer';
import { CallTranscript } from '../components/call-evaluation/CallTranscript';
import { AddMomentDrawer } from '../components/call-evaluation/AddMomentDrawer';
import {
	activeTurnAt,
	coachableMoments,
} from '../components/call-evaluation/callMoments';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mantine/core';
import { IconFlag } from '@tabler/icons-react';
import { useRoleMockStore } from '~/stores/roleMockStore';
import { useDisputesStore, selectCases } from '~/stores/qa/disputesStore';
import { hasOpenDispute } from '~/modules/qa/disputes/cases/helpers';
import OpenDisputeDrawer from '~/modules/qa/disputes/cases/components/OpenDisputeDrawer';
import { AssignContentDrawer } from '~/modules/qa/lms/components/AssignContentDrawer';
import { coachingSessionNewPath } from '~/modules/qa/coaching/constants';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import type { TeamRole } from '~/modules/qa/team/types';
import {
	selectMoments,
	useCallMomentsStore,
} from '~/stores/qa/callMomentsStore';

/** The simulated recording advances every tick. */
const PLAYBACK_TICK_MS = 250;

/** Shared style for a clickable breadcrumb Anchor, matching the pre-existing anchors in this file. */
const breadcrumbLinkStyle = {
	cursor: 'pointer',
	color: 'var(--mantine-color-dimmed)',
};

function renderBreadcrumbLink(key: string, label: string, onClick: () => void) {
	return (
		// inline-style-allow: reusing the pre-existing breadcrumb anchor style, same as the other Anchors in this file
		<Anchor key={key} onClick={onClick} style={breadcrumbLinkStyle}>
			{label}
		</Anchor>
	);
}

export default function ConversationEvaluations() {
	const navigate = useNavigate();
	const { campaignId, callId } = useParams();
	const [selectedTab, setSelectedTab] = useState<CallDetailTab>('qa');
	const [searchParams] = useSearchParams();
	const startAt = Number(searchParams.get('t'));
	const [currentTime, setCurrentTime] = useState(
		Number.isFinite(startAt) && startAt > 0 ? startAt : 0
	);
	const [isPlaying, setIsPlaying] = useState(false);
	const [disputeOpen, setDisputeOpen] = useState(false);
	const [activeMomentId, setActiveMomentId] = useState<string | null>(null);
	const [addMomentTurnId, setAddMomentTurnId] = useState<string | null>(null);
	const [addMomentOpen, setAddMomentOpen] = useState(false);
	const [assignOpen, setAssignOpen] = useState(false);
	const { t } = useTranslation('qa.disputes');
	const { t: tCalls } = useTranslation('qa.calls');
	const previewRole = useRoleMockStore((s) => s.previewRole);
	const disputeCases = useDisputesStore(selectCases);
	const allMoments = useCallMomentsStore(selectMoments);
	const setMomentStatus = useCallMomentsStore((s) => s.setStatus);
	const addMoment = useCallMomentsStore((s) => s.addMoment);
	const removeMoment = useCallMomentsStore((s) => s.removeMoment);

	const call = mockCallEvaluationDetail;
	const moments = useMemo(
		() => allMoments.filter((m) => m.callId === call.callId),
		[allMoments, call.callId]
	);
	const activeTurn = useMemo(
		() => activeTurnAt(call.transcript, currentTime),
		[call.transcript, currentTime]
	);
	// Agents see the moments and can jump to them; only reviewers edit them or send the call to coaching.
	const canReview = previewRole !== 'agent';
	const coachingRole: TeamRole =
		previewRole === 'qaManager' ? 'qa-manager' : 'supervisor';
	const campaignName = mockCampaignNames[campaignId || ''] || 'Campaign';
	const selectedMeta = [...CALL_EVALUATION_TABS, ESG_TAB].find(
		(tab) => tab.key === selectedTab
	)!;
	// Business Insights and ESG carry brand-level data the agent shouldn't see.
	const visibleTabs =
		previewRole === 'agent'
			? CALL_EVALUATION_TABS.filter((tab) => tab.key !== 'business-insights')
			: [...CALL_EVALUATION_TABS, ESG_TAB];
	// Disputes only exist for the agent role, who never reaches the ESG tab.
	const disputeType: DisputeEvaluationType =
		selectedTab === 'esg' ? 'qa' : selectedTab;
	const alreadyDisputed = hasOpenDispute(
		disputeCases,
		call.callId,
		disputeType
	);

	// Opening the page from a coaching session (?t=) lands on that moment.
	useEffect(() => {
		if (startAt > 0)
			setActiveMomentId(moments.find((m) => m.seconds === startAt)?.id ?? null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Simulated playback: the recording is a mock, so a timer drives the playhead.
	useEffect(() => {
		if (!isPlaying) return;
		const timer = window.setInterval(() => {
			setCurrentTime((time) => {
				const next = time + PLAYBACK_TICK_MS / 1000;
				if (next >= call.durationSeconds) {
					setIsPlaying(false);
					return call.durationSeconds;
				}
				return next;
			});
		}, PLAYBACK_TICK_MS);
		return () => window.clearInterval(timer);
	}, [isPlaying, call.durationSeconds]);

	const seek = (seconds: number) => {
		setCurrentTime(seconds);
		setActiveMomentId(null);
	};
	const jumpToMoment = (moment: CallMoment) => {
		setCurrentTime(moment.seconds);
		setActiveMomentId(moment.id);
		if (selectedTab !== 'qa') setSelectedTab('qa');
	};
	const flagTurn = (turn: TranscriptTurn) => {
		setAddMomentTurnId(turn.id);
		setAddMomentOpen(true);
	};
	const openAddMoment = () => {
		setAddMomentTurnId(activeTurn?.id ?? null);
		setAddMomentOpen(true);
	};

	const scheduleFromCall = () =>
		navigate(
			coachingSessionNewPath(coachingRole, {
				agent: call.agentId,
				call: call.callId,
				topic: tCalls('moments.coaching.topic', { callId: call.callId }),
			})
		);
	const assignReason = tCalls('moments.coaching.reason', {
		callId: call.callId,
		moments: coachableMoments(moments)
			.map((m) => `${m.timestamp} ${m.itemName}`)
			.join('; '),
	});

	// Calculate badge scores per tab
	const getTabBadge = () => {
		switch (selectedTab) {
			case 'qa':
				return `${call.qa.overallScore}%`;
			case 'sentiment-emotion':
				return `${call.sentiment.customer.overallScore.toFixed(1)}/5`;
			case 'compliance':
				return `${call.compliance.overallScore}%`;
			case 'esg':
				return `${call.esg.overallScore}%`;
			case 'business-insights':
				return `${call.business.signals.filter((s) => s.detected).length}/${call.business.signals.length}`;
			default:
				return '';
		}
	};

	return (
		<ContentContainer>
			<Stack gap='lg' style={{ width: '100%' }}>
				{/* Breadcrumbs */}
				<Group align='center' gap='sm'>
					<ActionIcon
						variant='subtle'
						onClick={() => navigate(-1)}
						title='Back'
						size='lg'
					>
						<IconArrowLeft size={20} />
					</ActionIcon>
					<Breadcrumbs style={{ flex: 1 }}>
						{previewRole === 'agent'
							? renderBreadcrumbLink(
									'my-calls',
									t('myCalls.breadcrumb', { ns: 'qa.calls' }),
									() => navigate('/qa/agent/calls')
								)
							: [
									renderBreadcrumbLink('campaigns', 'Campaigns', () =>
										navigate('/qa/campaigns')
									),
									renderBreadcrumbLink('campaign-name', campaignName, () =>
										navigate(`/qa/campaigns/${campaignId}`)
									),
								]}
						<Text size='sm' c='dimmed' fw={500}>
							Call {callId}
						</Text>
					</Breadcrumbs>
				</Group>

				{/* Header */}
				<div>
					<Title
						order={2}
						style={{
							fontSize: '1.75rem',
							fontWeight: 700,
							letterSpacing: '-0.02em',
							marginBottom: '0.5rem',
						}}
					>
						Call Evaluation
					</Title>
					<Text size='sm' c='dimmed'>
						{call.fileName} · {call.agentName} ·{' '}
						<Anchor
							size='sm'
							c='dimmed'
							underline='always'
							onClick={() =>
								navigate(`/qa/supervisor/customers/${call.customerId}`)
							}
						>
							{call.customerName}
						</Anchor>{' '}
						· {call.date} · {formatDuration(call.durationSeconds)} ·{' '}
						{call.direction === 'outbound' ? 'Outbound' : 'Inbound'}
					</Text>
				</div>

				{/* Tab buttons */}
				<Card padding='lg' radius='md' withBorder>
					<Stack gap='sm'>
						<Group
							justify='space-between'
							align='flex-start'
							wrap='wrap'
							gap='sm'
						>
							<Group gap='sm' wrap='wrap'>
								{visibleTabs.map((meta) => {
									const isSelected = selectedTab === meta.key;
									const Icon = meta.icon;
									const badge = (
										<Badge variant='light' color='gray' size='sm'>
											{getTabBadge()}
										</Badge>
									);
									return (
										<Button
											key={meta.key}
											variant={isSelected ? 'default' : 'subtle'}
											color='gray'
											fw={isSelected ? 600 : 500}
											onClick={() => setSelectedTab(meta.key)}
											leftSection={<Icon size={18} />}
											rightSection={badge}
										>
											{meta.label}
										</Button>
									);
								})}
							</Group>
							{canReview && (
								<Menu position='bottom-end' withinPortal>
									<Menu.Target>
										<Button
											variant='default'
											leftSection={<IconSchool size={16} />}
											rightSection={<IconChevronDown size={14} />}
										>
											{tCalls('moments.coaching.button')}
										</Button>
									</Menu.Target>
									<Menu.Dropdown>
										<Menu.Item
											leftSection={<IconCalendarEvent size={14} />}
											onClick={scheduleFromCall}
										>
											{tCalls('moments.coaching.schedule')}
										</Menu.Item>
										<Menu.Item
											leftSection={<IconBook size={14} />}
											onClick={() => setAssignOpen(true)}
										>
											{tCalls('moments.coaching.assign')}
										</Menu.Item>
									</Menu.Dropdown>
								</Menu>
							)}
							{previewRole === 'agent' && (
								<Tooltip
									label={t('cases.open.alreadyOpen')}
									disabled={!alreadyDisputed}
									withArrow
								>
									<Button
										variant='default'
										leftSection={<IconFlag size={16} />}
										disabled={alreadyDisputed}
										onClick={() => setDisputeOpen(true)}
									>
										{t('cases.open.button')}
									</Button>
								</Tooltip>
							)}
						</Group>
						<Text size='xs' c='dimmed'>
							{selectedMeta.description}
						</Text>
					</Stack>
				</Card>

				{/* 2-Column Layout */}
				<Grid gap='lg' style={{ minHeight: '600px' }}>
					{/* Left column: Player + Transcript (sticky) */}
					<Grid.Col span={{ base: 12, lg: 5 }}>
						<div style={{ position: 'sticky', top: 16 }}>
							<Stack gap='md'>
								<CallPlayer
									durationSeconds={call.durationSeconds}
									currentTime={currentTime}
									isPlaying={isPlaying}
									onTogglePlay={() => setIsPlaying((playing) => !playing)}
									onSeek={seek}
									moments={moments}
									activeMomentId={activeMomentId}
									onMomentClick={jumpToMoment}
								/>

								<CallTranscript
									turns={call.transcript}
									activeTurnId={activeTurn?.id ?? null}
									moments={moments}
									activeMomentId={activeMomentId}
									canReview={canReview}
									onSeek={seek}
									onMomentClick={jumpToMoment}
									onFlagTurn={flagTurn}
								/>
							</Stack>
						</div>
					</Grid.Col>

					{/* Right column: Evaluation panels */}
					<Grid.Col span={{ base: 12, lg: 7 }}>
						<Stack gap='md'>
							{selectedTab === 'qa' && (
								<QAEvaluationPanel
									qa={call.qa}
									moments={moments}
									activeMomentId={activeMomentId}
									canReview={canReview}
									onJump={jumpToMoment}
									onSetStatus={setMomentStatus}
									onRemoveMoment={removeMoment}
									onAddMoment={openAddMoment}
								/>
							)}
							{selectedTab === 'sentiment-emotion' && (
								<SentimentEmotionPanel
									sentiment={call.sentiment}
									agentId={call.agentId}
									voice={call.agentVoice}
									showBurnout={previewRole !== 'agent'}
								/>
							)}
							{selectedTab === 'compliance' && (
								<CompliancePanel compliance={call.compliance} />
							)}
							{selectedTab === 'esg' && previewRole !== 'agent' && (
								<EsgPanel esg={call.esg} />
							)}
							{selectedTab === 'business-insights' &&
								previewRole !== 'agent' && (
									<BusinessInsightsPanel business={call.business} />
								)}
						</Stack>
					</Grid.Col>
				</Grid>
			</Stack>

			<OpenDisputeDrawer
				opened={disputeOpen}
				onClose={() => setDisputeOpen(false)}
				call={call}
				campaignId={campaignId || ''}
				campaignName={campaignName}
				initialType={disputeType}
			/>

			<AddMomentDrawer
				opened={addMomentOpen}
				onClose={() => setAddMomentOpen(false)}
				turns={call.transcript}
				initialTurnId={addMomentTurnId}
				items={call.qa.aspects.flatMap((aspect) =>
					aspect.items.map((item) => ({
						id: item.id,
						name: item.name,
						errorType: item.errorType,
						aspectName: aspect.name,
					}))
				)}
				onSave={(input) => {
					const moment = addMoment({ callId: call.callId, ...input });
					notifySuccess(
						tCalls('moments.add.success', { time: moment.timestamp })
					);
					setActiveMomentId(moment.id);
					setCurrentTime(moment.seconds);
				}}
			/>

			<AssignContentDrawer
				opened={assignOpen}
				onClose={() => setAssignOpen(false)}
				role={coachingRole}
				preset={{ agentIds: [call.agentId], reason: assignReason }}
			/>
		</ContentContainer>
	);
}
