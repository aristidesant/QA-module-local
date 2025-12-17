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
	IconPhoneCall,
	IconTools,
	IconCheckupList,
	IconUsers,
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
		icon: IconSparkles,
		title: 'Smart Campaigns',
		description:
			'Automate your outreach with intelligent scheduling and real-time monitoring.',
		color: 'indigo',
	},
	{
		icon: IconRobot,
		title: 'AI Digital Agents',
		description:
			'Deploy lifelike voices that handle complex conversations with natural fluency.',
		color: 'blue',
	},
	{
		icon: IconPhoneCall,
		title: 'Interaction Hub',
		description:
			'Securely review transcripts and follow-ups for every AI-powered conversation.',
		color: 'teal',
	},
	{
		icon: IconTools,
		title: 'Seamless Tools',
		description:
			'Integrate your existing workflow with custom webhooks and technical powerups.',
		color: 'violet',
	},
	{
		icon: IconUsers,
		title: 'Active Contacts',
		description:
			'Effectively manage and segment your audience lists for maximum impact.',
		color: 'cyan',
	},
	{
		icon: IconCheckupList,
		title: 'Growth Analytics',
		description:
			'Transform call outcomes into actionable insights to scale your operations.',
		color: 'orange',
	},
];

export default function WelcomeCard({
	heading: propHeading,
	subheading: propSubheading,
}: WelcomeCardProps) {
	const isMasterClient = useIsMasterClient();
	const impersonationState = useImpersonationState();
	const { user, targetClient } = useSessionStore();

	let heading = propHeading || 'The Future of AI Voice';
	let subheading =
		propSubheading ||
		'Scale your business with intelligent conversational agents that handle every interaction with human-like precision.';

	const displayName = user?.firstName || user?.username;

	if (impersonationState.isImpersonating && targetClient) {
		heading = `Welcome to ${targetClient.name}`;
		subheading =
			'Your AI-powered destination for seamless voice automation and customer engagement.';
	} else if (displayName) {
		heading = `Welcome back, ${displayName}!`;
		subheading = isMasterClient
			? 'Gain a strategic snapshot of your entire conversational ecosystem.'
			: subheading;
	} else if (isMasterClient) {
		heading = 'Enterprise Overview';
		subheading =
			propSubheading ||
			'Gain a strategic snapshot of your entire conversational ecosystem.';
	}

	return (
		<div className={classes.wrapper}>
			<Card className={classes.heroCard} withBorder radius='md'>
				<Stack gap='xl'>
					<div className={classes.heroContent}>
						<Group justify='space-between' align='flex-start' wrap='nowrap'>
							<Stack gap='xs' maw={600}>
								<Group gap='xs'>
									<ThemeIcon variant='light' size='sm' radius='xl' color='blue'>
										<IconSparkles size={12} />
									</ThemeIcon>
									<Text size='xs' fw={700} tt='uppercase' lts={1} c='blue.6'>
										AI Management Platform
									</Text>
								</Group>
								<Title order={1} className={classes.heroTitle}>
									{heading}
								</Title>
								<Text size='sm' c='dimmed' className={classes.heroSubheading}>
									{subheading}
								</Text>
							</Stack>
						</Group>
					</div>

					<Divider variant='dashed' />

					<div className={classes.featuresSection}>
						<SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing='md'>
							{features.map((feature) => {
								const Icon = feature.icon;
								return (
									<div key={feature.title} className={classes.featureItem}>
										<Group wrap='nowrap' align='flex-start' gap='sm'>
											<ThemeIcon
												variant='light'
												size={32}
												radius='md'
												color={feature.color}
												className={classes.featureIcon}
											>
												<Icon size={18} />
											</ThemeIcon>
											<Stack gap={4}>
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
									</div>
								);
							})}
						</SimpleGrid>
					</div>
				</Stack>
			</Card>
		</div>
	);
}
