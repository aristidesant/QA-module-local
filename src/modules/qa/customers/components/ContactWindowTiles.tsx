import { Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { ContactWindowStat } from '../types';
import { windowHours, windowLabel } from '../helpers';

interface ContactWindowTilesProps {
	best: ContactWindowStat[];
	worst: ContactWindowStat[];
}

/** Best and worst contact windows as quiet rows: the headings carry the meaning, so no colour. */
export function ContactWindowTiles({ best, worst }: ContactWindowTilesProps) {
	const { t } = useTranslation('qa.customers');

	const renderTile = (
		w: ContactWindowStat,
		outcome: 'accepted' | 'rejected'
	) => (
		<Paper key={`${w.weekday}-${w.dayPart}`} withBorder p='sm' radius='md'>
			<Group justify='space-between'>
				<Text fw={600}>{windowLabel(w, t)}</Text>
				<Text size='xs' c='dimmed'>
					{windowHours(w)}
				</Text>
			</Group>
			<Text size='sm' mt={4}>
				{outcome === 'accepted' ? `${w.accepted} ✓` : `${w.rejected} ✕`}
			</Text>
			<Text size='xs' c='dimmed' mt={2}>
				{t('overview.windowStats', {
					answered: w.answered,
					contacts: w.contacts,
					accepted: w.accepted,
					rejected: w.rejected,
				})}
			</Text>
		</Paper>
	);

	return (
		<SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
			<Stack gap='xs'>
				<Text size='xs' fw={600} tt='uppercase' c='dimmed'>
					{t('overview.best')}
				</Text>
				{best.length === 0 ? (
					<Text c='dimmed' size='sm'>
						{t('overview.noWindows')}
					</Text>
				) : (
					best.map((w) => renderTile(w, 'accepted'))
				)}
			</Stack>
			<Stack gap='xs'>
				<Text size='xs' fw={600} tt='uppercase' c='dimmed'>
					{t('overview.worst')}
				</Text>
				{worst.length === 0 ? (
					<Text c='dimmed' size='sm'>
						{t('overview.noWindows')}
					</Text>
				) : (
					worst.map((w) => renderTile(w, 'rejected'))
				)}
			</Stack>
		</SimpleGrid>
	);
}
