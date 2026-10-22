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
import type { CallMoment, TranscriptTurn } from '../../types';
import { MOMENT_STATUS_COLOR, turnSeconds } from './callMoments';
import styles from './CallTranscript.module.css';

interface CallTranscriptProps {
	turns: TranscriptTurn[];
	activeTurnId: string | null;
	moments: CallMoment[];
	activeMomentId: string | null;
	canReview: boolean;
	onSeek: (seconds: number) => void;
	onMomentClick: (moment: CallMoment) => void;
	onFlagTurn: (turn: TranscriptTurn) => void;
}

/** Transcript that follows the playhead, shows the QA moments of each turn and lets a reviewer flag a new one. */
export function CallTranscript({
	turns,
	activeTurnId,
	moments,
	activeMomentId,
	canReview,
	onSeek,
	onMomentClick,
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
							const turnMoments = moments.filter((m) => m.turnId === turn.id);
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
											{turnMoments.map((m) => (
												<Badge
													key={m.id}
													size='xs'
													variant={m.id === activeMomentId ? 'filled' : 'light'}
													color={MOMENT_STATUS_COLOR[m.status]}
													className={pointerStyles.pointer}
													onClick={() => onMomentClick(m)}
												>
													{m.errorType}
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
									<Text size='sm'>{turn.text}</Text>
								</Paper>
							);
						})}
					</Stack>
				</ScrollArea>
			</Stack>
		</Card>
	);
}
