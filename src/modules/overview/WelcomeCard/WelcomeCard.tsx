import {
	Text,
	Title,
	Card,
	SimpleGrid,
	Stack,
	Group,
	ThemeIcon,
	Divider,
} from '@mantine/core';
import {
	IconRobot,
	IconListDetails,
	IconPhoneCall,
	IconTools,
	IconCheckupList,
	IconUsers,
	IconChevronRight,
	IconSparkles,
} from '@tabler/icons-react';
import { useIsMasterClient } from '~/hooks/useIsMasterClient';
import { useImpersonationState } from '~/hooks/useImpersonationState';
import { useSessionStore } from '~/stores/sessionStore';
import classes from './WelcomeCard.module.css';

export type WelcomeCardProps = {
	heading?: string;
	subheading?: string;
};

const features = [
	{
		icon: IconListDetails,
		title: 'Campaigns',
		description: 'Create, schedule, and monitor live runs',
		color: 'blue',
	},
	{
		icon: IconRobot,
		title: 'Agents',
		description: 'Adjust scripts, voices, and availability',
		color: 'cyan',
	},
	{
		icon: IconUsers,
		title: 'Contacts',
		description: 'Upload and review contact lists',
		color: 'teal',
	},
	{
		icon: IconPhoneCall,
		title: 'Conversations',
		description: 'Review transcripts and follow-ups',
		color: 'green',
	},
	{
		icon: IconCheckupList,
		title: 'Outcomes',
		description: 'Track call results and labels',
		color: 'orange',
	},
	{
		icon: IconTools,
		title: 'Tools',
		description: 'Fine-tune integrations and settings',
		color: 'violet',
	},
];

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
		return (
			<div className={classes.mainCard}>
				<Card className={classes.welcomeCard} withBorder>
					<Stack gap='xs' className={classes.body}>
						<Group
							align='flex-start'
							justify='space-between'
							gap='xs'
							className={classes.hero}
						>
							<Group gap='xs' align='center' wrap='nowrap'>
								<ThemeIcon
									size={36}
									radius='sm'
									variant='light'
									color='blue'
									className={classes.heroIcon}
								>
									<IconSparkles size={18} />
								</ThemeIcon>
								<Stack gap={2} className={classes.heroText}>
									<Title order={2} className={classes.welcomeTitle}>
										{heading}
									</Title>
									<Text
										size='sm'
										c='dimmed'
										className={classes.welcomeDescription}
									>
										{subheading}
									</Text>
								</Stack>
							</Group>
						</Group>

						<Divider className={classes.heroDivider} />

						<SimpleGrid
							cols={{ base: 1, md: 2 }}
							spacing='xs'
							className={classes.navigationGrid}
						>
							{features.map((feature) => {
								const Icon = feature.icon;
								return (
									<Card
										key={feature.title}
										className={classes.featureCard}
										withBorder
										data-color={feature.color}
									>
										<Group
											wrap='nowrap'
											align='center'
											justify='space-between'
											gap='xs'
										>
											<Group wrap='nowrap' align='flex-start' gap='xs'>
												<div
													className={classes.iconWrapper}
													data-color={feature.color}
												>
													<Icon size={18} />
												</div>
												<Stack gap={2} className={classes.featureContent}>
													<Text
														fw={600}
														size='sm'
														className={classes.featureTitle}
													>
														{feature.title}
													</Text>
													<Text
														size='xs'
														c='dimmed'
														className={classes.featureDescription}
													>
														{feature.description}
													</Text>
												</Stack>
											</Group>
											<IconChevronRight
												size={16}
												className={classes.featureChevron}
											/>
										</Group>
									</Card>
								);
							})}
						</SimpleGrid>
					</Stack>
				</Card>
			</div>
		);
	};

	return renderContent();
}
