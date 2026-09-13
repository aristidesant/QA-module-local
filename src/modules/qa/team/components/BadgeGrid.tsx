import { Paper, SimpleGrid, Stack, Text, ThemeIcon, Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import type { EarnedBadge } from '../types';
import { formatDate } from '../helpers';

interface BadgeGridProps {
	badges: EarnedBadge[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
	const { t } = useTranslation('qa.team');

	if (badges.length === 0) {
		return <EmptyState message={t('achievements.noBadges')} />;
	}

	return (
		<SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing='md'>
			{badges.map((badge) => (
				<Tooltip key={badge.id} label={badge.reason} withArrow>
					<Paper withBorder p='md' radius='md' ta='center'>
						<Stack align='center' gap={4}>
							{/* inline-style-allow: emoji glyph sizing inside a fixed icon circle */}
							<ThemeIcon size={48} radius='xl' variant='light' color='yellow'>
								<span style={{ fontSize: 24 }}>{badge.icon}</span>
							</ThemeIcon>
							<Text fw={600} size='sm'>{badge.name}</Text>
							<Text size='xs' c='dimmed'>{formatDate(badge.earnedAt)}</Text>
						</Stack>
					</Paper>
				</Tooltip>
			))}
		</SimpleGrid>
	);
}
