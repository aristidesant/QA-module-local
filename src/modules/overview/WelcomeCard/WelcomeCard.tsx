import { Text, Title, Card, SimpleGrid, Button, Stack } from '@mantine/core';
import {
	IconRobot,
	IconListDetails,
	IconPhoneCall,
	IconTools,
	IconCheckupList,
	IconUsers,
} from '@tabler/icons-react';
import { Link } from 'react-router';
import CampaignStatusCard from './CampaignStatusCard';
import ClientSearchBox from './ClientSearchBox';
import ClientList from './ClientList';
import DispositionChart from './DispositionChart';
import StatsCard from './StatsCard';
import { useImpersonationState } from '~/hooks/useImpersonationState';
import { useSessionStore } from '~/stores/sessionStore';
import classes from './WelcomeCard.module.css';

export type WelcomeCardProps = {
	heading?: string;
	subheading?: string;
};

export default function WelcomeCard({
	heading = 'Overview',
	subheading = 'Global performance snapshot across all clients',
}: WelcomeCardProps) {
	const { isImpersonating } = useImpersonationState();
	const { targetClient } = useSessionStore();

	// Update heading and subheading for impersonated users
	const displayHeading =
		isImpersonating && targetClient
			? `Welcome to ${targetClient.name}`
			: heading;
	const displaySubheading = isImpersonating
		? 'Your AI-powered call center management platform'
		: subheading;

	return (
		<div className={classes.container}>
			<div className={classes.header}>
				<Title order={1} className={classes.title}>
					{displayHeading}
				</Title>
				<Text size='sm' c='dimmed' className={classes.subtitle}>
					{displaySubheading}
				</Text>
			</div>

			<div className={classes.mainCard}>
				{!isImpersonating && (
					<div className={classes.topRow}>
						<CampaignStatusCard />
						<DispositionChart />
						<StatsCard />
					</div>
				)}

				{isImpersonating ? (
					<div className={classes.welcomeSection}>
						<Card className={classes.welcomeCard}>
							<Stack gap='xl'>
								<div className={classes.welcomeHeader}>
									<Title order={2} className={classes.welcomeTitle}>
										Welcome to your AI Call Center Platform
									</Title>
									<Text
										size='md'
										c='dimmed'
										className={classes.welcomeDescription}
									>
										Streamline your customer interactions with our intelligent
										AI-powered platform. From campaign management to real-time
										conversations, explore all the tools you need to enhance
										your call center operations.
									</Text>
								</div>

								<SimpleGrid
									cols={{ base: 1, sm: 2, lg: 3 }}
									spacing='md'
									className={classes.navigationGrid}
								>
									<Button
										component={Link}
										to='/campaigns'
										variant='subtle'
										leftSection={<IconListDetails size={20} />}
										className={classes.navButton}
									>
										<Stack gap={4} align='flex-start'>
											<Text fw={600} size='md'>
												Campaigns
											</Text>
											<Text size='sm' c='dimmed'>
												Create and manage targeted call campaigns
											</Text>
										</Stack>
									</Button>

									<Button
										component={Link}
										to='/agents'
										variant='subtle'
										leftSection={<IconRobot size={20} />}
										className={classes.navButton}
									>
										<Stack gap={4} align='flex-start'>
											<Text fw={600} size='md'>
												AI Agents
											</Text>
											<Text size='sm' c='dimmed'>
												Configure intelligent virtual agents
											</Text>
										</Stack>
									</Button>

									<Button
										component={Link}
										to='/contacts'
										variant='subtle'
										leftSection={<IconUsers size={20} />}
										className={classes.navButton}
									>
										<Stack gap={4} align='flex-start'>
											<Text fw={600} size='md'>
												Contacts
											</Text>
											<Text size='sm' c='dimmed'>
												Organize your customer database
											</Text>
										</Stack>
									</Button>

									<Button
										component={Link}
										to='/conversations'
										variant='subtle'
										leftSection={<IconPhoneCall size={20} />}
										className={classes.navButton}
									>
										<Stack gap={4} align='flex-start'>
											<Text fw={600} size='md'>
												Conversations
											</Text>
											<Text size='sm' c='dimmed'>
												Monitor live calls and analyze insights
											</Text>
										</Stack>
									</Button>

									<Button
										component={Link}
										to='/outcomes'
										variant='subtle'
										leftSection={<IconCheckupList size={20} />}
										className={classes.navButton}
									>
										<Stack gap={4} align='flex-start'>
											<Text fw={600} size='md'>
												Outcomes
											</Text>
											<Text size='sm' c='dimmed'>
												Track and categorize call results
											</Text>
										</Stack>
									</Button>

									<Button
										component={Link}
										to='/tools'
										variant='subtle'
										leftSection={<IconTools size={20} />}
										className={classes.navButton}
									>
										<Stack gap={4} align='flex-start'>
											<Text fw={600} size='md'>
												Tools
											</Text>
											<Text size='sm' c='dimmed'>
												Advanced configuration options
											</Text>
										</Stack>
									</Button>
								</SimpleGrid>
							</Stack>
						</Card>
					</div>
				) : (
					<div className={classes.bottomSection}>
						<div className={classes.sectionHeader}>
							<Title order={3} size='lg'>
								Client details overview
							</Title>
							<Text size='sm' c='dimmed'>
								Explore campaigns, performance, and account activity at a
								glance.
							</Text>
							<ClientSearchBox />
						</div>
						<ClientList />
					</div>
				)}
			</div>
		</div>
	);
}
