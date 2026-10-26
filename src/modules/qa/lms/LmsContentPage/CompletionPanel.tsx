import { Button, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';

interface CompletionPanelProps {
	metricName: string | null;
	nextTitle?: string;
	onBack: () => void;
	onNext?: () => void;
}

/** Replaces the player once the material is complete: one check, one sentence, where to go next. */
export function CompletionPanel({
	metricName,
	nextTitle,
	onBack,
	onNext,
}: CompletionPanelProps) {
	const { t } = useTranslation('qa.lms');
	return (
		<SectionCard padding='xl'>
			<Stack align='center' gap='sm' py='lg'>
				<ThemeIcon size={64} radius='xl' variant='light' color='green'>
					<IconCheck size={32} />
				</ThemeIcon>
				<Title order={3}>{t('player.completed.title')}</Title>
				<Text size='sm' ta='center' maw={420}>
					{metricName
						? t('player.completed.message', { metric: metricName })
						: t('player.completed.noImpact')}
				</Text>
				<Group gap='xs' mt='xs'>
					<Button variant='default' onClick={onBack}>
						{t('player.completed.backToList')}
					</Button>
					{nextTitle && onNext && (
						<Button onClick={onNext}>
							{t('player.completed.next', { title: nextTitle })}
						</Button>
					)}
				</Group>
			</Stack>
		</SectionCard>
	);
}
