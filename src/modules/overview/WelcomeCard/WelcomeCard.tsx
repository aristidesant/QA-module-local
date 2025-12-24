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
import { useTranslation } from 'react-i18next';
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
		titleKey: 'welcomeCard.features.smartCampaigns.title',
		descriptionKey: 'welcomeCard.features.smartCampaigns.description',
		color: 'indigo',
	},
	{
		icon: IconRobot,
		titleKey: 'welcomeCard.features.aiAgents.title',
		descriptionKey: 'welcomeCard.features.aiAgents.description',
		color: 'blue',
	},
	{
		icon: IconPhoneCall,
		titleKey: 'welcomeCard.features.interactionHub.title',
		descriptionKey: 'welcomeCard.features.interactionHub.description',
		color: 'teal',
	},
	{
		icon: IconTools,
		titleKey: 'welcomeCard.features.seamlessTools.title',
		descriptionKey: 'welcomeCard.features.seamlessTools.description',
		color: 'violet',
	},
	{
		icon: IconUsers,
		titleKey: 'welcomeCard.features.activeContacts.title',
		descriptionKey: 'welcomeCard.features.activeContacts.description',
		color: 'cyan',
	},
	{
		icon: IconCheckupList,
		titleKey: 'welcomeCard.features.growthAnalytics.title',
		descriptionKey: 'welcomeCard.features.growthAnalytics.description',
		color: 'orange',
	},
];

export default function WelcomeCard({
	heading: propHeading,
	subheading: propSubheading,
}: WelcomeCardProps) {
	const { t } = useTranslation();
	const isMasterClient = useIsMasterClient();
	const impersonationState = useImpersonationState();
	const { user, targetClient } = useSessionStore();

	let heading = propHeading || t('welcomeCard.defaultHeading');
	let subheading = propSubheading || t('welcomeCard.defaultSubheading');

	const displayName = user?.firstName || user?.username;

	if (impersonationState.isImpersonating && targetClient) {
		heading = t('welcomeCard.impersonationHeading', {
			name: targetClient.name,
		});
		subheading = t('welcomeCard.impersonationSubheading');
	} else if (displayName) {
		heading = t('welcomeCard.welcomeBackHeading', { name: displayName });
		subheading = isMasterClient
			? t('welcomeCard.masterSubheading')
			: subheading;
	} else if (isMasterClient) {
		heading = t('welcomeCard.enterpriseHeading');
		subheading = propSubheading || t('welcomeCard.masterSubheading');
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
										{t('welcomeCard.platformLabel')}
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
									<div key={feature.titleKey} className={classes.featureItem}>
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
													{t(feature.titleKey)}
												</Text>
												<Text
													size='xs'
													c='dimmed'
													className={classes.featureDescription}
												>
													{t(feature.descriptionKey)}
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
