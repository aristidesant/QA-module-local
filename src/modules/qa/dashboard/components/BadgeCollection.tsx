import React from 'react';
import { Stack, Group, Badge, Tooltip, ThemeIcon } from '@mantine/core';
import SectionCard from '~/components/SectionCard';

interface BadgeItem {
	id: number;
	name: string;
	description: string;
	emoji: string;
	earnedDate: string;
}

interface BadgeCollectionProps {
	badges: BadgeItem[];
	title?: string;
}

const BADGE_COLORS = ['blue', 'green', 'orange', 'red', 'purple', 'cyan'];

export const BadgeCollection: React.FC<BadgeCollectionProps> = ({
	badges,
	title = 'Badges Earned',
}) => {
	if (badges.length === 0) {
		return (
			<SectionCard title={title} description='No badges earned yet'>
				<Stack align='center' gap='sm' py='lg'>
					<Badge color='gray' variant='dot'>
						Keep working to earn badges!
					</Badge>
				</Stack>
			</SectionCard>
		);
	}

	return (
		<SectionCard title={title} description={`${badges.length} badges earned`}>
			<Group gap='md' wrap='wrap'>
				{badges.map((badge, idx) => (
					<Tooltip
						key={badge.id}
						label={`${badge.name} - ${badge.earnedDate}`}
						withArrow
					>
						<ThemeIcon
							variant='light'
							color={BADGE_COLORS[idx % BADGE_COLORS.length]}
							size='lg'
						>
							<span style={{ fontSize: '20px' }}>{badge.emoji}</span>
						</ThemeIcon>
					</Tooltip>
				))}
			</Group>
		</SectionCard>
	);
};
