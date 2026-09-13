import { useEffect, useRef, useState } from 'react';
import { ActionIcon, Button, Group, NavLink, Paper, Progress, Stack, Text } from '@mantine/core';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { LmsContent } from '~/models/qa';
import classes from './Players.module.css';

interface VideoPlayerMockProps {
	content: LmsContent;
	initialProgress: number;
	readOnly: boolean;
	onProgress: (percent: number) => void;
	onComplete: () => void;
}

const formatTime = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

export function VideoPlayerMock({ content, initialProgress, readOnly, onProgress, onComplete }: VideoPlayerMockProps) {
	const { t } = useTranslation('qa.lms');
	const totalSec = content.durationMin * 60;
	const [elapsed, setElapsed] = useState((initialProgress / 100) * totalSec);
	const [playing, setPlaying] = useState(false);
	const lastReported = useRef(Math.floor(initialProgress / 10));

	useEffect(() => {
		if (!playing) return;
		const id = window.setInterval(() => {
			setElapsed((prev) => {
				const next = Math.min(totalSec, prev + 20);
				if (next >= totalSec) setPlaying(false);
				return next;
			});
		}, 1000);
		return () => window.clearInterval(id);
	}, [playing, totalSec]);

	const percent = Math.round((elapsed / totalSec) * 100);

	useEffect(() => {
		const bucket = Math.floor(percent / 10);
		if (!readOnly && bucket > lastReported.current) {
			lastReported.current = bucket;
			onProgress(percent);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [percent, readOnly]);

	const activeChapter = (content.chapters ?? []).reduce(
		(acc, ch, i) => (elapsed >= ch.startSec ? i : acc),
		0
	);

	return (
		<Stack gap='md'>
			<div className={classes.poster} data-area={content.area}>
				<ActionIcon
					size={72}
					radius='xl'
					variant='default'
					className={classes.playButton}
					onClick={() => setPlaying((p) => !p)}
					aria-label={playing ? t('player.paused') : t('player.playing')}
				>
					{playing ? <IconPlayerPause size={32} /> : <IconPlayerPlay size={32} />}
				</ActionIcon>
			</div>

			<Stack gap={4}>
				<Progress value={percent} size='sm' radius='xl' />
				<Group justify='space-between'>
					<Text size='xs' c='dimmed'>
						{formatTime(elapsed)} / {formatTime(totalSec)}
					</Text>
					<Text size='xs' c='dimmed'>
						{playing ? t('player.playing') : t('player.paused')} · {percent}%
					</Text>
				</Group>
			</Stack>

			{content.chapters && content.chapters.length > 0 && (
				<Paper withBorder radius='md' p='xs'>
					<Text size='xs' c='dimmed' fw={600} tt='uppercase' mb={4}>
						{t('player.chapters')}
					</Text>
					<Stack gap={2}>
						{content.chapters.map((ch, i) => (
							<NavLink
								key={ch.title}
								label={ch.title}
								description={formatTime(ch.startSec)}
								active={i === activeChapter}
								className={i === activeChapter ? classes.chapterActive : undefined}
								onClick={() => setElapsed(ch.startSec)}
							/>
						))}
					</Stack>
				</Paper>
			)}

			{!readOnly && (
				<Group justify='flex-end'>
					<Button onClick={onComplete} disabled={percent < 80}>
						{t('player.markWatched')}
					</Button>
				</Group>
			)}
		</Stack>
	);
}
