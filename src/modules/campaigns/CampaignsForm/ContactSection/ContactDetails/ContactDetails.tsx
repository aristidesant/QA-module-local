import {
	Stack,
	Text,
	Group,
	Avatar,
	Card,
	SemiCircleProgress,
	Badge,
	Tooltip,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import {
	IconMoodHappy,
	IconMoodNeutral,
	IconMoodSad,
	IconAlertCircle,
} from '@tabler/icons-react';
import styles from './ContactDetails.module.css';
import type { PhoneValidationError } from '~/models/ContactsModel';

interface PhoneWithValidation {
	phoneNumber: string;
	validationError?: PhoneValidationError;
}

interface ContactDetailsProps {
	contact: {
		id: string;
		name: string;
		phone: string;
		email?: string;
		location?: string;
		language: string;
		initials: string;
		phones?: PhoneWithValidation[];
		engagementLevel?: number;
		qualificationScore?: number;
		sentiment?: {
			positive: number;
			neutral: number;
			negative: number;
		};
	};
}

export const ContactDetails = ({ contact }: ContactDetailsProps) => {
	const { t } = useTranslation('campaigns');
	const {
		name,
		phone,
		email,
		location,
		language,
		initials,
		phones = [],
		engagementLevel = 87,
		qualificationScore = 75,
		sentiment = { positive: 2113, neutral: 45, negative: 16 },
	} = contact;

	const getEngagementColor = (level: number) => {
		if (level >= 80) return 'green';
		if (level >= 60) return 'yellow';
		return 'red';
	};

	const getQualificationColor = (score: number) => {
		if (score >= 80) return 'green';
		if (score >= 60) return 'yellow';
		return 'red';
	};

	return (
		<Stack gap='xs' className={styles.container}>
			{/* Profile Section - No Card */}
			<div className={styles.profileSection}>
				<Group justify='center' mb='sm'>
					<div className={styles.avatarContainer}>
						<Avatar
							size={80}
							color='blue'
							radius='xl'
							className={styles.avatar}
						>
							{initials}
						</Avatar>
						<div className={styles.statusIndicator} />
					</div>
				</Group>

				<Stack gap='xs' align='center'>
					<Text size='lg' fw={600} className={styles.name}>
						{name}
					</Text>
					<Group gap='xs'>
						<div className={styles.flagIcon}>🇪🇸</div>
						<Text size='sm' c='dimmed'>
							{language}
						</Text>
					</Group>
				</Stack>
			</div>

			{/* Primary Phone Number Card */}
			<Card className={styles.infoCard}>
				<Group justify='space-between'>
					<Text size='sm' c='dimmed'>
						{t('form.contacts.details.primaryPhone')}
					</Text>
					<Text size='sm' fw={500}>
						{phone}
					</Text>
				</Group>
			</Card>

			{/* All Phone Numbers Card */}
			{phones && phones.length > 0 && (
				<Card className={styles.infoCard}>
					<Stack gap='xs'>
						<Text size='sm' c='dimmed' fw={500}>
							{t('form.contacts.details.phoneNumbers', {
								count: phones.length,
							})}
						</Text>
						{phones.map((phoneEntry, index) => (
							<div key={index} className={styles.phoneEntry}>
								<Group justify='space-between' align='flex-start' wrap='nowrap'>
									<Text size='sm' className={styles.phoneNumber}>
										{phoneEntry.phoneNumber}
									</Text>
									{phoneEntry.validationError && (
										<Tooltip
											label={phoneEntry.validationError.message}
											multiline
											w={220}
											withArrow
										>
											<Badge
												color='red'
												variant='light'
												size='sm'
												leftSection={<IconAlertCircle size={12} />}
												className={styles.errorBadge}
											>
												{phoneEntry.validationError.code}
											</Badge>
										</Tooltip>
									)}
								</Group>
								{phoneEntry.validationError && (
									<Text size='xs' c='red' className={styles.errorMessage}>
										{phoneEntry.validationError.message}
									</Text>
								)}
							</div>
						))}
					</Stack>
				</Card>
			)}

			{/* Email Card */}
			{email && (
				<Card className={styles.infoCard}>
					<Group justify='space-between'>
						<Text size='sm' c='dimmed'>
							{t('form.contacts.details.email')}
						</Text>
						<Text size='sm' fw={500}>
							{email}
						</Text>
					</Group>
				</Card>
			)}

			{/* Location Card */}
			{location && (
				<Card className={styles.infoCard}>
					<Group justify='space-between'>
						<Text size='sm' c='dimmed'>
							{t('form.contacts.details.location')}
						</Text>
						<Text size='sm' fw={500}>
							{location}
						</Text>
					</Group>
				</Card>
			)}

			{/* Engagement Level Card */}
			<Card className={styles.metricCard}>
				<Stack gap='sm' align='center'>
					<div className={styles.engagementCircle}>
						<SemiCircleProgress
							value={engagementLevel}
							size={120}
							thickness={8}
							fillDirection='left-to-right'
							orientation='up'
							filledSegmentColor={`var(--mantine-color-${getEngagementColor(
								engagementLevel
							)}-6)`}
							emptySegmentColor='var(--mantine-color-gray-2)'
							labelPosition='center'
							label={
								<Text component='span' size='xl' fw={700}>
									{engagementLevel}
								</Text>
							}
							className={styles.progressCircle}
						/>
					</div>

					<Stack gap='xs' align='center'>
						<Text size='sm' fw={600}>
							{t('form.contacts.details.engagementLevel.title')}
						</Text>
						<Text
							size='xs'
							c='dimmed'
							ta='center'
							className={styles.description}
						>
							{t('form.contacts.details.engagementLevel.description', {
								name: name.split(' ')[0],
							})}
						</Text>
					</Stack>
				</Stack>
			</Card>

			{/* Reviews Qualification Card */}
			<Card className={styles.metricCard}>
				<Stack gap='md' align='center'>
					<div className={styles.qualificationCircle}>
						<SemiCircleProgress
							value={qualificationScore}
							size={100}
							thickness={6}
							fillDirection='left-to-right'
							orientation='up'
							filledSegmentColor={`var(--mantine-color-${getQualificationColor(
								qualificationScore
							)}-6)`}
							emptySegmentColor='var(--mantine-color-gray-2)'
							labelPosition='center'
							label={
								<Text component='span' size='lg' fw={600}>
									{qualificationScore}%
								</Text>
							}
							className={styles.progressCircle}
						/>
					</div>

					<Stack gap='xs' align='center'>
						<Text size='sm' fw={600}>
							{t('form.contacts.details.reviewsQualification.title')}
						</Text>
						<Text
							size='xs'
							c='dimmed'
							ta='center'
							className={styles.description}
						>
							{t('form.contacts.details.reviewsQualification.description', {
								name: name.split(' ')[0],
							})}
						</Text>
					</Stack>

					{/* Sentiment Analysis */}
					<Stack gap='sm' w='100%'>
						<Group gap='sm' justify='space-between'>
							<Text size='sm' c='dimmed'>
								{t('form.contacts.details.sentiment.negative')}
							</Text>
							<Text size='sm' c='dimmed'>
								{t('form.contacts.details.sentiment.neutral')}
							</Text>
							<Text size='sm' c='dimmed'>
								{t('form.contacts.details.sentiment.positive')}
							</Text>
						</Group>

						<Group gap='lg' justify='space-between'>
							<Group gap='xs' className={styles.sentimentItem}>
								<IconMoodSad size={20} className={styles.negativeIcon} />
								<Text size='sm' fw={600}>
									{sentiment.negative}
								</Text>
							</Group>

							<Group gap='xs' className={styles.sentimentItem}>
								<IconMoodNeutral size={20} className={styles.neutralIcon} />
								<Text size='sm' fw={600}>
									{sentiment.neutral}
								</Text>
							</Group>

							<Group gap='xs' className={styles.sentimentItem}>
								<IconMoodHappy size={20} className={styles.positiveIcon} />
								<Text size='sm' fw={600}>
									{sentiment.positive}
								</Text>
							</Group>
						</Group>
					</Stack>
				</Stack>
			</Card>
		</Stack>
	);
};

export default ContactDetails;
