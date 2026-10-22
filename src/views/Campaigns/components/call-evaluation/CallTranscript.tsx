import { useEffect, useRef } from 'react';
import {
	ActionIcon,
	Badge,
	Card,
	Group,
	Paper,
	ScrollArea,
	Stack,
	Text,
	ThemeIcon,
	Tooltip,
} from '@mantine/core';
import {
	IconFlag,
	IconHeadset,
	IconPlayerPlay,
	IconUser,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import pointerStyles from '~/modules/qa/lms/components/Cards.module.css';
import type { TimelineAnchor, TranscriptTurn } from '../../types';
import { turnSeconds } from './callMoments';
import { ANCHOR_STATUS_COLOR, ANCHOR_STATUS_VARIANT } from './anchors';
import styles from './CallTranscript.module.css';

interface CallTranscriptProps {
	turns: TranscriptTurn[];
	activeTurnId: string | null;
	anchors: TimelineAnchor[];
	activeAnchorId: string | null;
	canReview: boolean;
	onSeek: (seconds: number) => void;
	onAnchorClick: (anchor: TimelineAnchor) => void;
	onFlagTurn: (turn: TranscriptTurn) => void;
}

/** Words of a turn, split so the ones an anchor points at can be underlined. */
const segmentsOf = (text: string, anchors: TimelineAnchor[]) => {
	const marks = anchors
		.map((a) => ({ a, start: a.highlight ? text.indexOf(a.highlight) : -1 }))
		.filter(({ a, start }) => a.highlight && start >= 0)
		.sort((x, y) => x.start - y.start);
	const out: { text: string; anchor?: TimelineAnchor }[] = [];
	let cursor = 0;
	for (const { a, start } of marks) {
		if (start < cursor) continue;
		if (start > cursor) out.push({ text: text.slice(cursor, start) });
		const end = start + (a.highlight?.length ?? 0);
		out.push({ text: text.slice(start, end), anchor: a });
		cursor = end;
	}
	if (cursor < text.length) out.push({ text: text.slice(cursor) });
	return out;
};

/** Transcript that follows the playhead, tags each turn with the findings of the open tab and lets a reviewer flag a new one. */
export function CallTranscript({
	turns,
	activeTurnId,
	anchors,
	activeAnchorId,
	canReview,
	onSeek,
	onAnchorClick,
	onFlagTurn,
}: CallTranscriptProps) {
	const { t } = useTranslation('qa.calls');
	const viewportRef = useRef<HTMLDivElement>(null);
	const turnRefs = useRef(new Map<string, HTMLDivElement>());

	// Keep the active turn inside the scroll area without moving the page.
	useEffect(() => {
		if (!activeTurnId) return;
		const el = turnRefs.current.get(activeTurnId);
		const viewport = viewportRef.current;
		if (!el || !viewport) return;
		const turnBox = el.getBoundingClientRect();
		const viewBox = viewport.getBoundingClientRect();
		if (turnBox.top < viewBox.top || turnBox.bottom > viewBox.bottom) {
			viewport.scrollTo({
				top:
					viewport.scrollTop +
					turnBox.top -
					viewBox.top -
					viewBox.height / 2 +
					turnBox.height / 2,
				behavior: 'smooth',
			});
		}
	}, [activeTurnId]);

	return (
		<Card padding='lg' radius='md' withBorder>
			<Stack gap='md'>
				<Group justify='space-between' align='center'>
					<Text fw={600} size='sm'>
						{t('moments.transcript.title')}
					</Text>
					<Badge size='sm' variant='light'>
						{t('moments.transcript.turns', { count: turns.length })}
					</Badge>
				</Group>
				<ScrollArea h={420} viewportRef={viewportRef}>
					<Stack gap='xs' pr='md'>
						{turns.map((turn) => {
							const turnAnchors = anchors.filter((a) => a.turnId === turn.id);
							return (
								<Paper
									key={turn.id}
									ref={(node: HTMLDivElement | null) => {
										if (node) turnRefs.current.set(turn.id, node);
										else turnRefs.current.delete(turn.id);
									}}
									radius='sm'
									p='xs'
									className={styles.turn}
									data-speaker={turn.speaker}
									data-active={turn.id === activeTurnId || undefined}
								>
									<Group justify='space-between' gap={6} mb={4} wrap='nowrap'>
										<Group gap={6} wrap='nowrap'>
											<ThemeIcon size='xs' variant='transparent'>
												{turn.speaker === 'agent' ? (
													<IconHeadset size={12} />
												) : (
													<IconUser size={12} />
												)}
											</ThemeIcon>
											<Text size='xs' c='dimmed'>
												{turn.speaker === 'agent'
													? t('moments.transcript.agent')
													: t('moments.transcript.customer')}{' '}
												· {turn.timestamp}
											</Text>
										</Group>
										<Group gap={4} wrap='nowrap'>
											{turnAnchors.map((a) => (
												<Badge
													key={a.id}
													size='xs'
													tt='none'
													variant={
														a.id === activeAnchorId
															? 'filled'
															: ANCHOR_STATUS_VARIANT[a.status]
													}
													color={
														a.id === activeAnchorId
															? 'gray'
															: ANCHOR_STATUS_COLOR[a.status]
													}
													className={pointerStyles.pointer}
													onClick={() => onAnchorClick(a)}
												>
													{a.tag}
												</Badge>
											))}
											<Tooltip label={t('moments.playFrom')} withArrow>
												<ActionIcon
													size='xs'
													variant='subtle'
													aria-label={t('moments.playFrom')}
													onClick={() => onSeek(turnSeconds(turn))}
												>
													<IconPlayerPlay size={12} />
												</ActionIcon>
											</Tooltip>
											{canReview && (
												<Tooltip label={t('moments.flagTurn')} withArrow>
													<ActionIcon
														size='xs'
														variant='subtle'
														color='gray'
														aria-label={t('moments.flagTurn')}
														onClick={() => onFlagTurn(turn)}
													>
														<IconFlag size={12} />
													</ActionIcon>
												</Tooltip>
											)}
										</Group>
									</Group>
									<Text size='sm'>
										{segmentsOf(turn.text, turnAnchors).map((segment, i) =>
											segment.anchor ? (
												<mark
													key={i}
													className={styles.mark}
													data-tone={ANCHOR_STATUS_COLOR[segment.anchor.status]}
													onClick={() => onAnchorClick(segment.anchor!)}
												>
													{segment.text}
												</mark>
											) : (
												segment.text
											)
										)}
									</Text>
								</Paper>
							);
						})}
					</Stack>
				</ScrollArea>
			</Stack>
		</Card>
	);
}
