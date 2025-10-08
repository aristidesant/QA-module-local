import { Box, Tabs, Loader, Center } from '@mantine/core';
import { IconInfoCircle, IconFileText } from '@tabler/icons-react';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { TranscriptContent } from '~/models/ConversationsModels';

import { TranscriptViewer } from '~/modules/conversations/TranscriptViewer';
// Analysis and Metadata panels removed from tabs — components may be deleted if unused elsewhere.
import styles from './ConversationDetails.module.css';
import ConversationOverview from '../ConversationOverview';
import { useGetConversation } from '~/queries/conversationsQueries';
dayjs.extend(relativeTime);

interface ConversationDetailsProps {
	id: number;
}

export function ConversationDetails({ id }: ConversationDetailsProps) {
	const {
		data: conversation,
		isLoading,
		isFetching,
	} = useGetConversation(`${id}`);

	const duration = useMemo(() => {
		const duration =
			conversation?.transcriptContent?.metadata?.call_duration_secs;
		return typeof duration === 'number' && !isNaN(duration) && duration > 0
			? duration
			: undefined;
	}, [conversation?.transcriptContent]);

	const status = conversation?.status;
	const transcriptContent = conversation?.transcriptContent;

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

	return (
		<Box p='md' className={styles.container}>
			<Tabs
				defaultValue='overview'
				classNames={{
					tab: styles.tab,
					list: styles.tabList,
				}}
			>
				<Tabs.List grow>
					<Tabs.Tab value='overview'>
						<Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<IconInfoCircle size={18} />
							<span>Overview</span>
						</Box>
					</Tabs.Tab>
					<Tabs.Tab value='transcript'>
						<Box style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<IconFileText size={18} />
							<span>Transcript</span>
						</Box>
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='overview' pt='md'>
					{conversation ? (
						<ConversationOverview
							conversation={conversation}
							status={safeStatus}
							duration={duration}
						/>
					) : null}
				</Tabs.Panel>

				<Tabs.Panel value='transcript' pt='md'>
					<TranscriptViewer transcript={safeTranscriptContent.transcript} />
				</Tabs.Panel>
			</Tabs>
		</Box>
	);
}

export default ConversationDetails;
