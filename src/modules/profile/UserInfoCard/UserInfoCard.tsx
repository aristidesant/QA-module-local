import {
	IconMail,
	IconUser,
	IconShieldCheck,
	IconBuildingSkyscraper,
	IconCalendar,
	IconShieldOff,
} from '@tabler/icons-react';
import { Stack, Text } from '@mantine/core';
import { useSessionStore } from '~/stores/sessionStore';
import { RightSectionCard } from '~/components/RightSectionCard/RightSectionCard';
import styles from './UserInfoCard.module.css';

export const UserInfoCard: React.FC = () => {
	const { user } = useSessionStore();

	if (!user) {
		return null;
	}

	// Get full name or fallback to username
	const fullName =
		user.firstName && user.lastName
			? `${user.firstName} ${user.lastName}`
			: user.firstName || user.lastName || user.username;

	// Get initials from firstName and lastName, or username
	const initials =
		user.firstName && user.lastName
			? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
			: user.username?.slice(0, 2).toUpperCase() || 'U';

	const isMFAEnabled = user?.mfaEnabled || false;
	const hasName = !!(user.firstName || user.lastName);

	// Format date if available
	const formatDate = (date: string | Date | null | undefined) => {
		if (!date) return 'N/A';
		try {
			return new Date(date).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			});
		} catch {
			return 'N/A';
		}
	};

	return (
		<Stack gap='md'>
			<RightSectionCard
				title='User Profile'
				icon={IconUser}
				iconColor='var(--mantine-color-indigo-6)'
			>
				<div className={styles.profileContent}>
					<div className={styles.avatarContainer}>
						<div className={styles.avatar}>{initials}</div>
					</div>
					<div className={styles.userInfo}>
						<h3 className={styles.userName}>{fullName}</h3>
						{hasName && <p className={styles.userUsername}>@{user.username}</p>}
						<div className={styles.emailBadge}>
							<IconMail size={14} />
							<span>{user.email}</span>
						</div>
					</div>
				</div>
			</RightSectionCard>

			<RightSectionCard
				title='Account Details'
				icon={IconShieldCheck}
				iconColor='var(--mantine-color-teal-6)'
			>
				<div className={styles.detailsList}>
					<div className={styles.detailItem}>
						<div className={styles.detailIcon}>
							<IconBuildingSkyscraper size={16} />
						</div>
						<div className={styles.detailContent}>
							<Text size='xs' c='dimmed' fw={600} tt='uppercase'>
								Client ID
							</Text>
							<Text size='sm' fw={700} className={styles.clientIdText}>
								#{user.clientId}
							</Text>
						</div>
					</div>

					<div className={styles.detailItem}>
						<div className={styles.detailIcon}>
							<IconCalendar size={16} />
						</div>
						<div className={styles.detailContent}>
							<Text size='xs' c='dimmed' fw={600} tt='uppercase'>
								Member Since
							</Text>
							<Text size='sm' fw={500}>
								{formatDate(user.createdAt)}
							</Text>
						</div>
					</div>

					<div className={styles.detailItem}>
						<div className={styles.detailIcon}>
							{isMFAEnabled ? (
								<IconShieldCheck
									size={16}
									color='var(--mantine-color-green-6)'
								/>
							) : (
								<IconShieldOff size={16} color='var(--mantine-color-red-6)' />
							)}
						</div>
						<div className={styles.detailContent}>
							<Text size='xs' c='dimmed' fw={600} tt='uppercase'>
								Security Status
							</Text>
							<div
								className={`${styles.mfaBadge} ${
									isMFAEnabled ? styles.mfaEnabled : styles.mfaDisabled
								}`}
							>
								{isMFAEnabled ? 'MFA Enabled' : 'MFA Disabled'}
							</div>
						</div>
					</div>
				</div>
			</RightSectionCard>
		</Stack>
	);
};
