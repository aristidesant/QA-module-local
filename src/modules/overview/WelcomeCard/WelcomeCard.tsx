import {
	Text,
	Title,
	Card,
	SimpleGrid,
	Button,
	Stack,
	Group,
	Badge,
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
import { useIsMasterClient } from '~/hooks/useIsMasterClient';
import { useImpersonationState } from '~/hooks/useImpersonationState';
import { useSessionStore } from '~/stores/sessionStore';
import CampaignStatusCard from './CampaignStatusCard';
import DispositionChart from './DispositionChart';
import StatsCard from './StatsCard';
import classes from './WelcomeCard.module.css';

export type WelcomeCardProps = {
	heading?: string;
	subheading?: string;
};

export default function WelcomeCard({
	heading: propHeading,
	subheading: propSubheading,
}: WelcomeCardProps) {
	const isMasterClient = useIsMasterClient();
	const impersonationState = useImpersonationState();
	const { user, targetClient } = useSessionStore();

	let heading = propHeading || 'Welcome';
	let subheading =
		propSubheading || 'Your AI-powered call center management platform';

	if (impersonationState.isImpersonating && targetClient) {
		heading = `Welcome to ${targetClient.name}`;
		subheading = 'Your AI-powered call center management platform';
	} else if (isMasterClient) {
		heading = user
			? `Client details overview ${user.clientId}`
			: 'Client details overview';
		subheading = propSubheading || 'Global Snapshot';
	}

	const renderContent = () => {
		if (isMasterClient && !impersonationState.isImpersonating) {
			return (
				<div className={classes.mainCard}>
					<CampaignStatusCard />
					<DispositionChart />
					<StatsCard />
				</div>
			);
		}

		return (
			<div className={classes.mainCard}>
				<Card className={classes.welcomeCard} withBorder>
					<Stack gap='lg'>
						<div className={classes.welcomeHeader}>
							<Group gap='xs'>
								<Badge size='sm' variant='light' color='blue'>
									Workspace overview
								</Badge>
								<Text size='xs' c='dimmed'>
									Fast links into your daily workflows
								</Text>
							</Group>
							<Title order={2} className={classes.welcomeTitle}>
								Stay organized across campaigns, agents, and conversations
							</Title>
							<Text size='sm' c='dimmed' className={classes.welcomeDescription}>
								Navigate to the areas you need most. All tools share the same
								lightweight layout so you can move quickly between tasks.
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
										<Text fw={600} size='sm'>
											Campaigns
										</Text>
										<Text size='xs' c='dimmed'>
											Create, schedule, and monitor live runs
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
										<Text fw={600} size='sm'>
											Agents
										</Text>
										<Text size='xs' c='dimmed'>
											Adjust scripts, voices, and availability
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
										<Text fw={600} size='sm'>
											Contacts
										</Text>
										<Text size='xs' c='dimmed'>
											Upload and review contact lists
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
										<Text fw={600} size='sm'>
											Conversations
										</Text>
										<Text size='xs' c='dimmed'>
											Review transcripts and follow-ups
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
										<Text fw={600} size='sm'>
											Outcomes
										</Text>
										<Text size='xs' c='dimmed'>
											Track call results and labels
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
										<Text fw={600} size='sm'>
											Tools
										</Text>
										<Text size='xs' c='dimmed'>
											Fine-tune integrations and settings
										</Text>
									</Stack>
								</Group>
							</Button>
						</SimpleGrid>
					</Stack>
				</Card>
			</div>
		);
	};

	return (
		<ContentContainer title={heading} description={subheading}>
			{renderContent()}
		</ContentContainer>
	);
}
