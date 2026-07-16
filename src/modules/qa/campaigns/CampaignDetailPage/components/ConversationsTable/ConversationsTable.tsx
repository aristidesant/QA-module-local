import {
	ActionIcon,
	Badge,
	Group,
	Pagination,
	Select,
	Stack,
	Text,
	Tooltip,
} from '@mantine/core';
import {
	IconClipboardCheck,
	IconFileText,
	IconPlayerPlay,
	IconTrash,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router';

import BaseTable, { type BaseTableColumnDef } from '~/components/BaseTable';
import { getMediaTypeColor } from '~/modules/qa/constants/badgeColors';
import {
	useDateFormatter,
	useNumberFormatter,
} from '~/modules/qa/hooks/useFormatters';
import type { Conversation } from '~/models/qa';
import { hasAudio } from '../../CampaignDetailPage.helpers';
import ConversationTranscription from '../ConversationTranscription';
import classes from './ConversationsTable.module.css';

export interface ConversationsTableProps {
	conversations: Conversation[];
	campaignId: number;
	audioPendingId: number | null;
	onPlayAudio: (conversation: Conversation) => void;
	onSeeTranscript: (conversation: Conversation) => void;
	onDeleteConversation: (conversation: Conversation) => void;
	page: number;
	pageSize: string;
	totalPages: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (value: string) => void;
}

export default function ConversationsTable({
	conversations,
	campaignId,
	audioPendingId,
	onPlayAudio,
	onSeeTranscript,
	onDeleteConversation,
	page,
	pageSize,
	totalPages,
	onPageChange,
	onPageSizeChange,
}: ConversationsTableProps) {
	const { t } = useTranslation('qa.campaigns');
	const dateFormatter = useDateFormatter('dateTime');
	const numberFormatter = useNumberFormatter({ maximumFractionDigits: 1 });

	const getAudioSizeLabel = (bytes?: number | null) => {
		if (!bytes || bytes <= 0) {
			return null;
		}

		if (bytes >= 1024 * 1024) {
			return t('detail.conversations.audioSize.megabytes', {
				size: numberFormatter.format(bytes / (1024 * 1024)),
			});
		}

		return t('detail.conversations.audioSize.kilobytes', {
			size: numberFormatter.format(bytes / 1024),
		});
	};

	const getAudioDurationLabel = (seconds?: number | null) => {
		if (!seconds || seconds <= 0) {
			return null;
		}

		const roundedSeconds = Math.round(seconds);
		const minutes = Math.floor(roundedSeconds / 60);
		const remainingSeconds = String(roundedSeconds % 60).padStart(2, '0');

		return t('detail.conversations.duration', {
			minutes,
			seconds: remainingSeconds,
		});
	};

	const columns: BaseTableColumnDef<Conversation>[] = [
		{
			id: 'externalRef',
			enableSorting: false,
			header: t('detail.conversations.table.externalRef'),
			cell: ({ row: { original: conversation } }) => (
				<Stack gap={2}>
					<Text fw={700} size='sm'>
						{conversation.externalRef || t('detail.conversations.noReference')}
					</Text>
					<Text c='dimmed' size='xs'>
						{t('detail.conversations.table.identifier', {
							id: conversation.id,
						})}
					</Text>
				</Stack>
			),
		},
		{
			id: 'media',
			enableSorting: false,
			header: t('detail.conversations.table.media'),
			cell: ({ row }) => {
				const conversation = row.original;
				const mediaType = conversation.mediaType ?? null;
				const source = conversation.source ?? null;
				const audioDetails = [
					getAudioDurationLabel(conversation.audioDurationSeconds),
					getAudioSizeLabel(conversation.audioSizeBytes),
				].filter(Boolean);

				return (
					<Stack gap={4}>
						<Group gap={4} wrap='nowrap'>
							<Badge
								color={getMediaTypeColor(mediaType)}
								size='sm'
								variant='light'
							>
								{mediaType
									? t(`media.${mediaType.toLowerCase()}`)
									: t('media.unknown')}
							</Badge>
							{source ? (
								<Badge color='green' size='sm' variant='light'>
									{t(`source.${source.toLowerCase()}`)}
								</Badge>
							) : null}
						</Group>
						{audioDetails.length > 0 ? (
							<Text c='dimmed' size='xs'>
								{audioDetails.join(' · ')}
							</Text>
						) : null}
					</Stack>
				);
			},
		},
		{
			id: 'transcription',
			enableSorting: false,
			header: t('detail.conversations.table.transcription'),
			cell: ({ row: { original: conversation } }) =>
				hasAudio(conversation) ? (
					<ConversationTranscription conversation={conversation} />
				) : (
					<Text c='dimmed' size='xs'>
						{t('detail.conversations.transcription.noAudio')}
					</Text>
				),
		},
		{
			id: 'createdAt',
			enableSorting: false,
			header: t('detail.conversations.table.createdAt'),
			cell: ({ row: { original: conversation } }) => (
				<Text c='dimmed' size='sm'>
					{conversation.createdAt
						? dateFormatter.format(new Date(conversation.createdAt))
						: t('detail.conversations.noDate')}
				</Text>
			),
		},
		{
			id: 'actions',
			enableSorting: false,
			header: t('detail.conversations.table.actions'),
			cell: ({ row: { original: conversation } }) => (
				<Group
					className={classes.actions}
					gap='xs'
					justify='flex-end'
					wrap='nowrap'
				>
					<Tooltip label={t('detail.conversations.actions.evaluate')}>
						<ActionIcon
							aria-label={t('detail.conversations.actions.evaluate')}
							component={RouterLink}
							radius='md'
							to={`/qa/evaluations/new?campaignId=${campaignId}&conversationId=${conversation.id}`}
							variant='light'
						>
							<IconClipboardCheck size={16} />
						</ActionIcon>
					</Tooltip>
					{hasAudio(conversation) ? (
						<Tooltip label={t('detail.conversations.actions.playAudio')}>
							<ActionIcon
								aria-label={t('detail.conversations.actions.playAudio')}
								loading={audioPendingId === conversation.id}
								onClick={() => onPlayAudio(conversation)}
								radius='md'
								variant='light'
							>
								<IconPlayerPlay size={16} />
							</ActionIcon>
						</Tooltip>
					) : null}
					{hasAudio(conversation) &&
					conversation.transcriptionStatus === 'COMPLETED' ? (
						<Tooltip label={t('detail.conversations.actions.seeTranscript')}>
							<ActionIcon
								aria-label={t('detail.conversations.actions.seeTranscript')}
								loading={audioPendingId === conversation.id}
								onClick={() => onSeeTranscript(conversation)}
								radius='md'
								variant='light'
							>
								<IconFileText size={16} />
							</ActionIcon>
						</Tooltip>
					) : null}
					<Tooltip label={t('detail.conversations.actions.delete')}>
						<ActionIcon
							aria-label={t('detail.conversations.actions.delete')}
							color='red'
							onClick={() => onDeleteConversation(conversation)}
							radius='md'
							variant='subtle'
						>
							<IconTrash size={16} />
						</ActionIcon>
					</Tooltip>
				</Group>
			),
		},
	];

	return (
		<>
			<BaseTable
				columns={columns}
				data={conversations}
				getRowId={(conversation) => String(conversation.id)}
			/>
			<Group justify='space-between'>
				<Select
					allowDeselect={false}
					data={[
						{ label: '10', value: '10' },
						{ label: '25', value: '25' },
						{ label: '50', value: '50' },
						{ label: '100', value: '100' },
					]}
					label={t('pagination.pageSize')}
					onChange={(value) => {
						if (value) {
							onPageSizeChange(value);
						}
					}}
					size='xs'
					value={pageSize}
				/>
				<Pagination
					onChange={onPageChange}
					size='sm'
					total={totalPages}
					value={page}
				/>
			</Group>
		</>
	);
}
