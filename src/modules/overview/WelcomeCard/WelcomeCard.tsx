import { Text, Title, Card, SimpleGrid, Stack, Group } from '@mantine/core';
import {
	IconRobot,
	IconListDetails,
	IconPhoneCall,
	IconTools,
	IconCheckupList,
	IconUsers,
} from '@tabler/icons-react';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
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
					<Stack gap='xs'>
						<div className={classes.welcomeHeader}>
							<Title order={2} className={classes.welcomeTitle}>
								Your workspace overview
							</Title>
							<Text size='sm' c='dimmed' className={classes.welcomeDescription}>
								Manage campaigns, agents, and conversations from a unified
								platform
							</Text>
						</div>

						<SimpleGrid
							cols={{ base: 1, sm: 2, lg: 3 }}
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
									>
										<Group wrap='nowrap' align='flex-start' gap='xs'>
											<div
												className={classes.iconWrapper}
												data-color={feature.color}
											>
												<Icon size={18} />
											</div>
											<Stack gap={2} style={{ flex: 1 }}>
												<Text fw={600} size='sm'>
													{feature.title}
												</Text>
												<Text size='xs' c='dimmed'>
													{feature.description}
												</Text>
											</Stack>
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

	return (
		<ContentContainer title={heading} description={subheading}>
			{renderContent()}
		</ContentContainer>
	);
}
