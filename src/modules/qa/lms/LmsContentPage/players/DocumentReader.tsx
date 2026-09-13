import { useRef, useState } from 'react';
import { Button, Group, Paper, Progress, ScrollArea, Stack, Text, useComputedColorScheme } from '@mantine/core';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { useTranslation } from 'react-i18next';
import type { LmsContent } from '~/models/qa';
import classes from './Players.module.css';

interface DocumentReaderProps {
	content: LmsContent;
	initialProgress: number;
	readOnly: boolean;
	onProgress: (percent: number) => void;
	onComplete: () => void;
}

export function DocumentReader({ content, initialProgress, readOnly, onProgress, onComplete }: DocumentReaderProps) {
	const { t } = useTranslation('qa.lms');
	const colorScheme = useComputedColorScheme('light');
	const [percent, setPercent] = useState(initialProgress);
	const lastReported = useRef(Math.floor(initialProgress / 10));
	const viewportRef = useRef<HTMLDivElement>(null);

	const handleScroll = ({ y }: { x: number; y: number }) => {
		const viewport = viewportRef.current;
		const max = viewport ? viewport.scrollHeight - viewport.clientHeight : 0;
		const next = max > 0 ? Math.min(100, Math.round((y / max) * 100)) : 100;
		setPercent((prev) => Math.max(prev, next));
		const bucket = Math.floor(next / 10);
		if (!readOnly && bucket > lastReported.current) {
			lastReported.current = bucket;
			onProgress(next);
		}
	};

	return (
		<Stack gap='md'>
			<Paper withBorder radius='md' p='md'>
				<ScrollArea h={520} viewportRef={viewportRef} onScrollPositionChange={handleScroll} type='auto'>
					<MarkdownPreview
						source={content.body ?? ''}
						className={classes.markdown}
						wrapperElement={{ 'data-color-mode': colorScheme }}
					/>
				</ScrollArea>
			</Paper>

			<Stack gap={4}>
				<Progress value={percent} size='sm' radius='xl' />
				<Group justify='space-between'>
					<Text size='xs' c='dimmed'>
						{t('player.readingProgress')}
					</Text>
					<Text size='xs' c='dimmed'>
						{percent}%
					</Text>
				</Group>
			</Stack>

			{!readOnly && (
				<Group justify='flex-end'>
					<Button onClick={onComplete} disabled={percent < 90}>
						{t('player.markRead')}
					</Button>
				</Group>
			)}
		</Stack>
	);
}
