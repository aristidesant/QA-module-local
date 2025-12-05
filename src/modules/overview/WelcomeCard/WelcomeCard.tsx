import {
	Text,
	Title,
	Card,
	SimpleGrid,
	Button,
	Stack,
	Group,
} from '@mantine/core';
import {
	IconRobot,
	IconListDetails,
	IconPhoneCall,
	IconTools,
	IconCheckupList,
	IconUsers,
} from '@tabler/icons-react';
import { Link } from 'react-router';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import CampaignStatusCard from './CampaignStatusCard';
import ClientSearchBox from './ClientSearchBox';
import ClientList from './ClientList';
import DispositionChart from './DispositionChart';
import StatsCard from './StatsCard';
import { useIsMasterClient } from '~/hooks/useIsMasterClient';
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
	const isMasterClient = useIsMasterClient();
	const { isImpersonating } = useImpersonationState();
	const { targetClient, user } = useSessionStore();

	const showMasterDashboard = isMasterClient && !isImpersonating;

	// Update heading and subheading for impersonated users
	const displayHeading =
		isImpersonating && targetClient
			? `Welcome to ${targetClient.name}`
			: heading;
	const displaySubheading = showMasterDashboard
		? subheading
		: 'Your AI-powered call center management platform';

	return (
		<ContentContainer title={displayHeading} description={displaySubheading}>
			<div className={classes.mainCard}>
				{showMasterDashboard && (
					<div className={classes.topRow}>
						<CampaignStatusCard />
						<DispositionChart />
						<StatsCard />
					</div>
				)}

				{showMasterDashboard ? (
					<div className={classes.bottomSection}>
						<div className={classes.sectionHeader}>
							<Title order={3} size='lg'>
								Client details overview {user?.clientId}
							</Title>
							<Text size='sm' c='dimmed'>
								Explore campaigns, performance, and account activity at a
								glance.
							</Text>
							<ClientSearchBox />
						</div>
						<ClientList />
					</div>
				) : (
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
										className={classes.navButton}
									>
										<Group wrap='nowrap' align='flex-start'>
											<IconListDetails size={20} />
											<Stack gap={4} align='flex-start'>
												<Text fw={600} size='md'>
													Campaigns
												</Text>
												<Text size='sm' c='dimmed'>
													Create and manage targeted call campaigns
												</Text>
											</Stack>
										</Group>
									</Button>

									<Button
										component={Link}
										to='/agents'
										variant='subtle'
										className={classes.navButton}
									>
										<Group wrap='nowrap' align='flex-start'>
											<IconRobot size={20} />
											<Stack gap={4} align='flex-start'>
												<Text fw={600} size='md'>
													Agents
												</Text>
												<Text size='sm' c='dimmed'>
													Manage and create new agents
												</Text>
											</Stack>
										</Group>
									</Button>

									<Button
										component={Link}
										to='/contacts'
										variant='subtle'
										className={classes.navButton}
									>
										<Group wrap='nowrap' align='flex-start'>
											<IconUsers size={20} />
											<Stack gap={4} align='flex-start'>
												<Text fw={600} size='md'>
													Contacts
												</Text>
												<Text size='sm' c='dimmed'>
													Manage and upload contact lists
												</Text>
											</Stack>
										</Group>
									</Button>

									<Button
										component={Link}
										to='/conversations'
										variant='subtle'
										className={classes.navButton}
									>
										<Group wrap='nowrap' align='flex-start'>
											<IconPhoneCall size={20} />
											<Stack gap={4} align='flex-start'>
												<Text fw={600} size='md'>
													Conversations
												</Text>
												<Text size='sm' c='dimmed'>
													Review and analyze call transcripts
												</Text>
											</Stack>
										</Group>
									</Button>

									<Button
										component={Link}
										to='/outcomes'
										variant='subtle'
										className={classes.navButton}
									>
										<Group wrap='nowrap' align='flex-start'>
											<IconCheckupList size={20} />
											<Stack gap={4} align='flex-start'>
												<Text fw={600} size='md'>
													Outcomes
												</Text>
												<Text size='sm' c='dimmed'>
													Track and categorize call results
												</Text>
											</Stack>
										</Group>
									</Button>

									<Button
										component={Link}
										to='/tools'
										variant='subtle'
										className={classes.navButton}
									>
										<Group wrap='nowrap' align='flex-start'>
											<IconTools size={20} />
											<Stack gap={4} align='flex-start'>
												<Text fw={600} size='md'>
													Tools
												</Text>
												<Text size='sm' c='dimmed'>
													Advanced configuration options
												</Text>
											</Stack>
										</Group>
									</Button>
								</SimpleGrid>
							</Stack>
						</Card>
					</div>
				)}
			</div>
		</ContentContainer>
	);
}
