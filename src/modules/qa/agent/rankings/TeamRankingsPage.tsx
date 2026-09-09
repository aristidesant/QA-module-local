import React from 'react';
import { Stack, Text, Title } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import ExpandedRankingsTable from './components/ExpandedRankingsTable';

/**
 * Team Rankings page: full leaderboard for the current period.
 *
 * MVP renders the expanded table only. Period selector, sort presets and
 * filters land in follow-up tasks.
 */
export const TeamRankingsPage: React.FC = () => (
	<ContentContainer contentWidth='full'>
		<Stack gap='lg'>
			<div>
				<Title order={1}>Team Rankings</Title>
				<Text c='dimmed' mt='xs'>
					Agent performance leaderboard this period
				</Text>
			</div>

			<SectionCard
				title='Leaderboard'
				description='All team members ranked by score'
			>
				<ExpandedRankingsTable />
			</SectionCard>
		</Stack>
	</ContentContainer>
);

export default TeamRankingsPage;
