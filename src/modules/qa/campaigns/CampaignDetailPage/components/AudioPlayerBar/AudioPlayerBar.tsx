import {
	ActionIcon,
	Alert,
	Badge,
	Group,
	Paper,
	ScrollArea,
	Skeleton,
	Stack,
	Text,
	ThemeIcon,
} from '@mantine/core';
import {
	IconAlertTriangle,
	IconFileText,
	IconHeadphones,
	IconX,
} from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Conversation, ConversationTranscriptSegment } from '~/models/qa';
import { useConversationTranscriptQuery } from '~/queries/qa/conversationsQueries';
import { hasAudio } from '../../CampaignDetailPage.helpers';
import classes from './AudioPlayerBar.module.css';

export interface AudioPlayerBarProps {
	conversation: Conversation | null;
	audioUrl: string | null;
	error: string | null;
	loading: boolean;
	onClose: () => void;
}

/**
 * Number of distinct speaker color slots defined in the CSS module. Speakers
 * beyond this count reuse a slot; two-party calls (the common case) never do.
 */
const SPEAKER_COLOR_SLOTS = 4;

interface SpeakerMeta {
	/** Color slot (0..SPEAKER_COLOR_SLOTS-1) driving the speaker rail/accent. */
	slot: number;
	/** Human-facing speaker name (backend label or a localized fallback). */
	displayName: string;
}

function formatTimestamp(seconds: number | null) {
	if (seconds === null || seconds < 0) return null;

	const roundedSeconds = Math.floor(seconds);
	const minutes = Math.floor(roundedSeconds / 60);
	const remainingSeconds = String(roundedSeconds % 60).padStart(2, '0');

	return `${minutes}:${remainingSeconds}`;
}

/**
 * Compact audio/transcript review panel docked inside the content column
 * (sticky at the viewport bottom) so the page stays interactive while
 * listening and reviewing completed transcripts.
 */
export default function AudioPlayerBar({
	conversation,
	audioUrl,
	error,
	loading,
	onClose,
}: AudioPlayerBarProps) {
	const { t } = useTranslation('qa.campaigns');
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
		null
	);
	const transcriptEnabled =
		Boolean(conversation?.id) &&
		conversation?.transcriptionStatus === 'COMPLETED' &&
		Boolean(conversation && hasAudio(conversation));
	const transcriptQuery = useConversationTranscriptQuery(
		conversation?.id ?? Number.NaN,
		'FULL',
		transcriptEnabled
	);
	const transcriptSegments = useMemo(
		() => transcriptQuery.data?.segments ?? [],
		[transcriptQuery.data?.segments]
	);
	const selectedSegment = selectedSegmentId
		? transcriptSegments.find((segment) => segment.id === selectedSegmentId)
		: null;

	// Assign each distinct speaker a stable color slot and conversation side in
	// order of first appearance, so a two-party call reads like a chat thread.
	const speakerMeta = useMemo<SpeakerMeta[]>(() => {
		const order = new Map<string, number>();

		return transcriptSegments.map((segment) => {
			const rawLabel = segment.speakerLabel?.trim();
			const key = rawLabel || '__unknown__';

			if (!order.has(key)) {
				order.set(key, order.size);
			}

			const speakerIndex = order.get(key) ?? 0;
			const displayName =
				rawLabel || t('detail.audio.speaker', { index: speakerIndex + 1 });

			return {
				slot: speakerIndex % SPEAKER_COLOR_SLOTS,
				displayName,
			};
		});
	}, [transcriptSegments, t]);

	useEffect(() => {
		setSelectedSegmentId(null);
	}, [conversation?.id]);

	const seekToSegment = (segment: ConversationTranscriptSegment) => {
		setSelectedSegmentId(segment.id);

		if (segment.startSeconds === null || !audioRef.current) {
			return;
		}

		audioRef.current.currentTime = segment.startSeconds;
		audioRef.current.focus();
	};

	const updateSelectedSegmentFromAudio = () => {
		if (!audioRef.current || transcriptSegments.length === 0) return;

		const currentTime = audioRef.current.currentTime;
		const matchingSegment = transcriptSegments.find((segment, index) => {
			if (segment.startSeconds === null) return false;

			const nextSegment = transcriptSegments[index + 1];
			const segmentEnd =
				segment.endSeconds ??
				nextSegment?.startSeconds ??
				Number.POSITIVE_INFINITY;

			return currentTime >= segment.startSeconds && currentTime < segmentEnd;
		});

		if (matchingSegment && matchingSegment.id !== selectedSegment?.id) {
			setSelectedSegmentId(matchingSegment.id);
		}
	};

	return (
		<Paper
			aria-label={t('detail.audio.title')}
			className={classes.audioBar}
			radius='md'
			role='region'
			shadow='md'
			withBorder
		>
			<Group
				className={classes.audioBarHeader}
				gap='sm'
				justify='space-between'
			>
				<Group className={classes.audioBarMeta} gap='xs' wrap='nowrap'>
					<ThemeIcon radius='md' size='lg' variant='light'>
						<IconHeadphones size={16} />
					</ThemeIcon>
					<Stack gap={0}>
						<Text fw={600} lineClamp={1} size='sm'>
							{conversation?.externalRef ||
								t('detail.conversations.noReference')}
						</Text>
						{conversation ? (
							<Text c='dimmed' size='xs'>
								{t('detail.conversations.table.identifier', {
									id: conversation.id,
								})}
							</Text>
						) : null}
					</Stack>
				</Group>
				{transcriptEnabled ? (
					<Badge leftSection={<IconFileText size={12} />} variant='light'>
						{t('detail.audio.transcriptTitle')}
					</Badge>
				) : null}
				<ActionIcon
					aria-label={t('detail.audio.close')}
					onClick={onClose}
					radius='md'
					variant='subtle'
				>
					<IconX size={16} />
				</ActionIcon>
			</Group>

			<div className={classes.audioLayout}>
				<div className={classes.audioBarBody}>
					{loading ? <Skeleton height={40} radius='xl' /> : null}
					{error ? (
						<Alert
							color='red'
							icon={<IconAlertTriangle size={16} />}
							title={t('detail.audio.errorTitle')}
							variant='light'
						>
							{error}
						</Alert>
					) : null}
					{audioUrl ? (
						<audio
							ref={audioRef}
							aria-label={t('detail.audio.playerLabel')}
							className={classes.audioPlayer}
							controls
							onTimeUpdate={updateSelectedSegmentFromAudio}
							src={audioUrl}
						>
							{t('detail.audio.unsupported')}
						</audio>
					) : null}
				</div>

				{transcriptEnabled ? (
					<Stack className={classes.transcriptPanel} gap='xs'>
						<Group gap='xs' justify='space-between'>
							<Text fw={700} size='sm'>
								{t('detail.audio.transcriptTitle')}
							</Text>
							{selectedSegment ? (
								<Text c='dimmed' size='xs'>
									{formatTimestamp(selectedSegment.startSeconds) ??
										t('detail.audio.noTimestamp')}
								</Text>
							) : null}
						</Group>

						{transcriptQuery.isLoading ? (
							<Stack gap='xs'>
								<Text c='dimmed' size='xs'>
									{t('detail.audio.transcriptLoading')}
								</Text>
								<Skeleton height={28} radius='md' />
								<Skeleton height={28} radius='md' width='80%' />
							</Stack>
						) : null}

						{transcriptQuery.isError ? (
							<Alert
								color='yellow'
								icon={<IconAlertTriangle size={16} />}
								title={t('detail.audio.transcriptUnavailableTitle')}
								variant='light'
							>
								{t('detail.audio.transcriptUnavailable')}
							</Alert>
						) : null}

						{!transcriptQuery.isLoading &&
						!transcriptQuery.isError &&
						transcriptSegments.length === 0 ? (
							<Text c='dimmed' size='sm'>
								{t('detail.audio.transcriptUnavailable')}
							</Text>
						) : null}

						{transcriptSegments.length > 0 ? (
							<ScrollArea.Autosize mah={280} offsetScrollbars>
								<Stack gap={2}>
									{transcriptSegments.map((segment, index) => {
										const timestamp =
											formatTimestamp(segment.startSeconds) ??
											t('detail.audio.noTimestamp');
										const meta = speakerMeta[index];
										const selected = selectedSegmentId === segment.id;

										return (
											<button
												key={segment.id}
												aria-label={t('detail.audio.seekTo', {
													time: timestamp,
												})}
												aria-pressed={selected}
												className={
													selected
														? `${classes.turn} ${classes.turnSelected}`
														: classes.turn
												}
												data-speaker-slot={meta.slot}
												onClick={() => seekToSegment(segment)}
												type='button'
											>
												<span className={classes.turnHeader}>
													<span className={classes.speakerLabel}>
														{meta.displayName}
													</span>
													<span className={classes.timestampLabel}>
														{timestamp}
													</span>
												</span>
												<span className={classes.segmentText}>
													{segment.text}
												</span>
											</button>
										);
									})}
								</Stack>
							</ScrollArea.Autosize>
						) : null}
					</Stack>
				) : null}
			</div>
		</Paper>
	);
}
