import { Badge, Button, Group, Loader, Tooltip } from '@mantine/core';
import { IconAlertTriangle, IconFileText } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TRANSCRIPTION_STATUS_COLORS } from '~/modules/qa/constants/badgeColors';
import type { Conversation, TranscriptionStatus } from '~/models/qa';
import {
	useTranscribeConversationMutation,
	useTranscriptionStatusQuery,
} from '~/queries/qa/conversationsQueries';
import { notifyError } from '~/modules/qa/utils/notifications';

interface ConversationTranscriptionProps {
	conversation: Conversation;
}

/**
 * Renders the STT transcription status for a conversation and lets the operator
 * trigger (or re-run) transcription. Polls the status endpoint while a job runs.
 */
export default function ConversationTranscription({
	conversation,
}: ConversationTranscriptionProps) {
	const { t } = useTranslation('qa.campaigns');
	const initialStatus = conversation.transcriptionStatus ?? null;
	const isActiveInitially =
		initialStatus === 'PENDING' || initialStatus === 'PROCESSING';
	const [enabled, setEnabled] = useState(isActiveInitially);
	const statusQuery = useTranscriptionStatusQuery(conversation.id, enabled);
	const transcribeMutation = useTranscribeConversationMutation(conversation.id);

	const liveStatus = enabled ? statusQuery.data?.status : undefined;
	const status: TranscriptionStatus | null = liveStatus ?? initialStatus;
	const liveError = enabled ? statusQuery.data?.error : undefined;
	const error: string | null =
		liveError ?? conversation.transcriptionError ?? null;
	const isRunning = status === 'PENDING' || status === 'PROCESSING';

	const transcribe = async () => {
		try {
			await transcribeMutation.mutateAsync({});
			setEnabled(true);
		} catch (mutationError) {
			notifyError(mutationError);
		}
	};

	return (
		<Group gap='xs' wrap='nowrap'>
			{status ? (
				<Badge
					color={TRANSCRIPTION_STATUS_COLORS[status]}
					leftSection={
						isRunning ? <Loader color='blue' size={10} /> : undefined
					}
					variant='light'
				>
					{t(
						`detail.conversations.transcription.status.${status.toLowerCase()}`
					)}
				</Badge>
			) : null}
			{status === 'FAILED' && error ? (
				<Tooltip label={error} multiline w={240}>
					<IconAlertTriangle color='var(--mantine-color-red-6)' size={16} />
				</Tooltip>
			) : null}
			{!isRunning ? (
				<Button
					leftSection={<IconFileText size={14} />}
					loading={transcribeMutation.isPending}
					onClick={() => void transcribe()}
					size='xs'
					variant={status ? 'subtle' : 'light'}
				>
					{t(
						status
							? 'detail.conversations.transcription.rerun'
							: 'detail.conversations.transcription.action'
					)}
				</Button>
			) : null}
		</Group>
	);
}
