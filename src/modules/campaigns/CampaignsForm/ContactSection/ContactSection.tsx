import { Group, Stack } from '@mantine/core';
import { ActiveContactList } from './ActiveContactList';
import { StatusBreakdown } from './StatusBreakdown';
import { ContactQualityScore } from './ContactQualityScore';
import { MostUsedContactChannels } from './MostUsedContactChannels';
import { ContactListOverview } from './ContactListOverview';
import styles from './ContactSection.module.css';
import SectionCard from '~/components/SectionCard';

export const ContactSection = () => {
	return (
		<>
			<ActiveContactList />

			<SectionCard
				title={'Contact Statistics'}
				description={
					'Overview of your contact statistics including status breakdown, quality score, and most used channels.'
				}
			>
				<Group gap='md' className={styles.statsContainer}>
					{/*  Status Breakdown */}
					<div className={styles.statusBreakdown}>
						<StatusBreakdown />
					</div>

					{/* Quality Score and Channels */}
					<Stack
						align='stretch'
						justify='stretch'
						gap='md'
						className={styles.rightColumn}
					>
						<ContactQualityScore />
						<MostUsedContactChannels />
					</Stack>
				</Group>
			</SectionCard>

			{/* Contact List Overview */}
			<ContactListOverview />
		</>
	);
};
