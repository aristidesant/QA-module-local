import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import NameChangeSection from './NameChangeSection';
import PasswordChangeSection from './PasswordChangeSection';
import UserInfoCard from './UserInfoCard';
import styles from './ProfilePage.module.css';

const ProfilePage: React.FC = () => {
	const { t } = useTranslation('profile');

	return (
		<ContentContainer title={t('title')} description={t('description')}>
			<div className={styles.page}>
				<UserInfoCard />
				<div className={styles.settingsGrid}>
					<div className={styles.primarySection}>
						<NameChangeSection />
					</div>
					<div className={styles.primarySection}>
						<PasswordChangeSection />
					</div>
				</div>
			</div>
		</ContentContainer>
	);
};

export { ProfilePage };
export default ProfilePage;
