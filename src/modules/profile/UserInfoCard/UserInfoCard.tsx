import {
	IconAt,
	IconCalendar,
	IconBuildingSkyscraper,
	IconMail,
	IconShieldCheck,
	IconShieldOff,
} from '@tabler/icons-react';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useSessionStore } from '~/stores/sessionStore';
import MFASection from '../MFASection';
import styles from './UserInfoCard.module.css';

export const UserInfoCard: React.FC = () => {
	const { t, i18n } = useTranslation('profile');
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
			return new Date(date).toLocaleDateString(i18n.language, {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			});
		} catch {
			return 'N/A';
		}
	};

	return (
		<section className={styles.summaryCard} aria-label={t('user_info.title')}>
			<div className={styles.identityBlock}>
				<div className={styles.avatarContainer}>
					<div className={styles.avatar}>{initials}</div>
				</div>
				<div className={styles.userInfo}>
					<div className={styles.identityHeading}>
						<Text component='p' className={styles.sectionLabel}>
							{t('user_info.title')}
						</Text>
						<h2 className={styles.userName}>{fullName}</h2>
					</div>
					{hasName && <p className={styles.userUsername}>@{user.username}</p>}
					<div className={styles.contactList}>
						<div className={styles.contactRow}>
							<IconMail size={15} stroke={1.8} />
							<span>{user.email}</span>
						</div>
						<div className={styles.contactRow}>
							<IconAt size={15} stroke={1.8} />
							<span>
								{t('user_info.username_label')}: {user.username}
							</span>
						</div>
					</div>
				</div>
			</div>

			<div className={styles.detailsGrid}>
				<div className={styles.detailItem}>
					<div className={styles.detailIcon}>
						<IconBuildingSkyscraper size={16} stroke={1.8} />
					</div>
					<div className={styles.detailContent}>
						<Text component='p' className={styles.detailLabel}>
							{t('user_info.client_id')}
						</Text>
						<Text component='p' className={styles.detailValue}>
							#{user.clientId}
						</Text>
					</div>
				</div>

				<div className={styles.detailItem}>
					<div className={styles.detailIcon}>
						<IconCalendar size={16} stroke={1.8} />
					</div>
					<div className={styles.detailContent}>
						<Text component='p' className={styles.detailLabel}>
							{t('user_info.member_since')}
						</Text>
						<Text component='p' className={styles.detailValue}>
							{formatDate(user.createdAt)}
						</Text>
					</div>
				</div>

				<div className={styles.detailItem}>
					<div className={styles.detailIcon}>
						{isMFAEnabled ? (
							<IconShieldCheck size={16} stroke={1.8} />
						) : (
							<IconShieldOff size={16} stroke={1.8} />
						)}
					</div>
					<div className={styles.detailContent}>
						<Text component='p' className={styles.detailLabel}>
							{t('user_info.security_status')}
						</Text>
						<Text
							component='p'
							className={`${styles.detailValue} ${
								isMFAEnabled ? styles.stateSecure : styles.stateMuted
							}`}
						>
							{isMFAEnabled
								? t('user_info.mfa_enabled')
								: t('user_info.mfa_disabled')}
						</Text>
					</div>
				</div>
			</div>

			<div className={styles.securityPanel}>
				<MFASection />
			</div>
		</section>
	);
};
