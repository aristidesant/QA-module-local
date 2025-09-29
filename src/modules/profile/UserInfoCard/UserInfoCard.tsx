import {
	IconMail,
	IconUser,
	IconShieldCheck,
	IconCircleCheck,
	IconBuildingSkyscraper,
	IconCalendar,
	IconShieldOff,
} from '@tabler/icons-react';
import { Divider, Text } from '@mantine/core';
import { useSessionStore } from '~/stores/sessionStore';
import styles from './UserInfoCard.module.css';

export const UserInfoCard: React.FC = () => {
	const { user } = useSessionStore();

	if (!user) {
		return null;
	}

	const initials = user.username?.slice(0, 2).toUpperCase() || 'U';
	const isMFAEnabled = user?.mfaEnabled || false;
	const isActive = user.status === 'active';

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
		<div className={styles.card}>
			{/* Header Section */}
			<div className={styles.header}>
				<div className={styles.avatarContainer}>
					<div className={styles.avatar}>{initials}</div>
				</div>
				<div className={styles.userInfo}>
					<h3 className={styles.userName}>{user.username}</h3>
					<p className={styles.userEmail}>{user.email}</p>
					<div className={styles.statusContainer}>
						<span
							className={`${styles.statusBadge} ${
								isActive ? styles.active : styles.inactive
							}`}
						>
							<IconCircleCheck size={14} stroke={2} />
							<span>{isActive ? 'Active' : 'Inactive'}</span>
						</span>
					</div>
				</div>
			</div>

			<Divider my='lg' color='gray.2' />

			{/* Information Grid */}
			<div className={styles.infoGrid}>
				<div className={styles.infoRow}>
					<div className={styles.infoLabel}>
						<IconUser size={16} stroke={1.5} className={styles.labelIcon} />
						<Text size='xs' c='dimmed' fw={500}>
							Username
						</Text>
					</div>
					<div className={styles.infoValue}>
						<Text size='sm' fw={500}>
							{user.username}
						</Text>
					</div>
				</div>

				<div className={styles.infoRow}>
					<div className={styles.infoLabel}>
						<IconMail size={16} stroke={1.5} className={styles.labelIcon} />
						<Text size='xs' c='dimmed' fw={500}>
							Email Address
						</Text>
					</div>
					<div className={styles.infoValue}>
						<Text size='sm' fw={500} className={styles.emailText}>
							{user.email}
						</Text>
					</div>
				</div>

				<div className={styles.infoRow}>
					<div className={styles.infoLabel}>
						<IconBuildingSkyscraper
							size={16}
							stroke={1.5}
							className={styles.labelIcon}
						/>
						<Text size='xs' c='dimmed' fw={500}>
							Client ID
						</Text>
					</div>
					<div className={styles.infoValue}>
						<Text size='sm' fw={600} className={styles.clientIdText}>
							#{user.clientId}
						</Text>
					</div>
				</div>

				<div className={styles.infoRow}>
					<div className={styles.infoLabel}>
						<IconCalendar size={16} stroke={1.5} className={styles.labelIcon} />
						<Text size='xs' c='dimmed' fw={500}>
							Member Since
						</Text>
					</div>
					<div className={styles.infoValue}>
						<Text size='sm' fw={500}>
							{formatDate(user.createdAt)}
						</Text>
					</div>
				</div>
			</div>

			<Divider my='lg' color='gray.2' />

			{/* Security Section */}
			<div className={styles.securitySection}>
				<div className={styles.sectionTitle}>
					<IconShieldCheck
						size={18}
						stroke={1.5}
						className={styles.sectionIcon}
					/>
					<Text size='sm' fw={600}>
						Security
					</Text>
				</div>
				<div className={styles.securityCard}>
					<div className={styles.securityItem}>
						<Text size='xs' c='dimmed' fw={500}>
							Two-Factor Authentication
						</Text>
						<div
							className={`${styles.mfaBadge} ${
								isMFAEnabled ? styles.mfaEnabled : styles.mfaDisabled
							}`}
						>
							{isMFAEnabled ? (
								<IconShieldCheck size={16} stroke={2} />
							) : (
								<IconShieldOff size={16} stroke={2} />
							)}
							<Text size='sm' fw={600}>
								{isMFAEnabled ? 'Enabled' : 'Disabled'}
							</Text>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
