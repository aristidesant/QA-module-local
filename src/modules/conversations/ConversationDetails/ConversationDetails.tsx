import {
	Box,
	Tabs,
	Loader,
	Center,
	Stack,
	ActionIcon,
	Tooltip,
} from '@mantine/core';
import { IconInfoCircle, IconFileText, IconArrowUp } from '@tabler/icons-react';
import { useMemo, useState, useCallback, useRef } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { TranscriptContent } from '~/models/ConversationsModels';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import AccessDenied from '~/components/AccessDenied';
import { useTranslation } from 'react-i18next';

import { TranscriptViewer } from '~/modules/conversations/TranscriptViewer';
import TranscriptPlayerBar from '~/modules/conversations/TranscriptViewer/TranscriptPlayerBar';
import styles from './ConversationDetails.module.css';
import ConversationOverview from '../ConversationOverview';
import { useGetConversation } from '~/queries/conversationsQueries';
dayjs.extend(relativeTime);

interface ConversationDetailsProps {
	id: number;
}

export function ConversationDetails({ id }: ConversationDetailsProps) {
	const { t } = useTranslation(['conversations', 'common']);
	const {
		data: conversation,
		isLoading,
		isFetching,
	} = useGetConversation(`${id}`);

	const { canAccessModule } = usePermissions();
	const canViewConversations = canAccessModule(ModuleEnum.CONVERSATIONS);

	const [activeTab, setActiveTab] = useState<string | null>('overview');
	const [showBackToTop, setShowBackToTop] = useState(false);
	const [audioCurrentTime, setAudioCurrentTime] = useState(0);
	const [isAudioPlaying, setIsAudioPlaying] = useState(false);
	const transcriptPanelRef = useRef<HTMLDivElement>(null);
	const seekToRef = useRef<((time: number) => void) | null>(null);

	const handlePanelScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
		setShowBackToTop(e.currentTarget.scrollTop > 200);
	}, []);

	const scrollToTop = useCallback(() => {
		transcriptPanelRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
	}, []);

	const handleSeekToTime = useCallback((time: number) => {
		seekToRef.current?.(time);
	}, []);

	const duration = useMemo(() => {
		const duration =
			conversation?.transcriptContent?.metadata?.call_duration_secs;
		return typeof duration === 'number' && !isNaN(duration) && duration > 0
			? duration
			: undefined;
	}, [conversation?.transcriptContent]);

	const status = conversation?.status;
	const transcriptContent = conversation?.transcriptContent;

	const nodeLabels = useMemo<Record<string, string>>(() => {
		const nodes = conversation?.campaign?.agents?.[0]?.agent?.config?.workflow
			?.nodes as Record<string, { label?: string }> | undefined;
		if (!nodes) return {};
		return Object.fromEntries(
			Object.entries(nodes)
				.filter(([, node]) => node?.label)
				.map(([nodeId, node]) => [nodeId, node.label as string])
		);
	}, [conversation?.campaign?.agents?.[0]?.agent?.config?.workflow?.nodes]);

	const safeStatus = status || '';
	const safeTranscriptContent: TranscriptContent = transcriptContent || {
		transcript: [],
		metadata: {
			cost: 0,
			feedback: {
				likes: 0,
				dislikes: 0,
				overall_score: null,
			},
			call_duration_secs: 0,
			termination_reason: '',
			start_time_unix_secs: 0,
		},
		analysis: {
			call_successful: '',
			transcript_summary: '',
			data_collection_results: {},
			evaluation_criteria_results: {},
		},
		conversationInitiationClientData: {
			dynamic_variables: {},
			custom_llm_extra_body: {},
			conversation_config_override: {},
		},
	};

	if (isLoading || isFetching) {
		return (
			<Center p='md' className={styles.container}>
				<Loader size='lg' color='var(--mantine-primary-color-filled)' />
			</Center>
		);
	}

	if (!canViewConversations) {
		return <AccessDenied description={t('list.accessDenied')} />;
	}

	return (
		<Box className={styles.container}>
			<Tabs
				value={activeTab}
				onChange={setActiveTab}
				classNames={{
					tab: styles.tab,
					list: styles.tabList,
					root: styles.tabsRoot,
				}}
			>
				<Tabs.List grow>
					<Tabs.Tab value='overview'>
						<Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<IconInfoCircle size={18} />
							<span>{t('details.tabs.overview')}</span>
						</Box>
					</Tabs.Tab>
					<Tabs.Tab value='transcript'>
						<Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<IconFileText size={18} />
							<span>{t('details.tabs.transcript')}</span>
						</Box>
					</Tabs.Tab>
				</Tabs.List>

				{activeTab === 'overview' && (
					<div className={styles.panelWrapper}>
						{conversation ? (
							<Stack>
								<ConversationOverview
									conversation={conversation}
									status={safeStatus}
									duration={duration}
								/>
							</Stack>
						) : null}
					</div>
				)}

				{activeTab === 'transcript' && (
					<div className={styles.transcriptPanelLayout}>
						<div
							ref={transcriptPanelRef}
							className={styles.panelWrapper}
							onScroll={handlePanelScroll}
						>
							<TranscriptViewer
								transcript={safeTranscriptContent.transcript}
								audioCurrentTime={audioCurrentTime}
								isAudioPlaying={isAudioPlaying}
								onSeekToTime={handleSeekToTime}
								nodeLabels={nodeLabels}
							/>
							{!isAudioPlaying && (
								<Tooltip label={t('details.backToTop')} position='left'>
									<ActionIcon
										variant='filled'
										size='lg'
										radius='xl'
										aria-label={t('details.backToTop')}
										onClick={scrollToTop}
										className={`${styles.backToTop} ${showBackToTop ? styles.backToTopVisible : ''}`}
									>
										<IconArrowUp size={18} />
									</ActionIcon>
								</Tooltip>
							)}
						</div>
						{conversation?.voiceFile && (
							<TranscriptPlayerBar
								voiceFile={conversation.voiceFile}
								onTimeUpdate={setAudioCurrentTime}
								onPlayStateChange={setIsAudioPlaying}
								seekToRef={seekToRef}
							/>
						)}
					</div>
				)}
			</Tabs>
		</Box>
	);
}

export default ConversationDetails;
