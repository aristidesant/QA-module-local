import { Badge, Group, Paper, Progress, SimpleGrid, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { ContactWindowStat } from '../types';
import { windowHours, windowLabel } from '../helpers';

interface ContactWindowTilesProps {
	best: ContactWindowStat[];
	worst: ContactWindowStat[];
}

export function ContactWindowTiles({ best, worst }: ContactWindowTilesProps) {
	const { t } = useTranslation('qa.customers');

	const renderTile = (w: ContactWindowStat, color: 'teal' | 'red') => (
		<Paper key={`${w.weekday}-${w.dayPart}`} withBorder p='sm' radius='md' bg={`var(--mantine-color-${color}-light)`}>
			<Group justify='space-between'>
				<Text fw={600}>{windowLabel(w, t)}</Text>
				<Text size='xs' c='dimmed'>{windowHours(w)}</Text>
			</Group>
			<Badge color={color} variant='filled' mt={4}>
				{color === 'teal' ? `${w.accepted} ✓` : `${w.rejected} ✕`}
			</Badge>
			<Text size='xs' c='dimmed' mt={4}>
				{t('overview.windowStats', { answered: w.answered, contacts: w.contacts, accepted: w.accepted, rejected: w.rejected })}
			</Text>
			<Progress value={w.contacts ? (w.answered / w.contacts) * 100 : 0} color={color} size='xs' mt={4} />
		</Paper>
	);

	return (
		<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
			<Stack gap='xs'>
				<Text size='xs' fw={600} tt='uppercase' c='teal'>{t('overview.best')}</Text>
				{best.length === 0 ? <Text c='dimmed' size='sm'>{t('overview.noWindows')}</Text> : best.map((w) => renderTile(w, 'teal'))}
			</Stack>
			<Stack gap='xs'>
				<Text size='xs' fw={600} tt='uppercase' c='red'>{t('overview.worst')}</Text>
				{worst.length === 0 ? <Text c='dimmed' size='sm'>{t('overview.noWindows')}</Text> : worst.map((w) => renderTile(w, 'red'))}
			</Stack>
		</SimpleGrid>
	);
}
