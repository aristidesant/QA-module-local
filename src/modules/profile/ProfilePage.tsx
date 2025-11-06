import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import NameChangeSection from './NameChangeSection';
import PasswordChangeSection from './PasswordChangeSection';
import MFASection from './MFASection';
import UserInfoCard from './UserInfoCard';
import styles from './ProfilePage.module.css';

const ProfilePage: React.FC = () => {
	return (
		<ContentContainer
			title='Profile Settings'
			description='Manage your account security and preferences'
			rightSection={<UserInfoCard />}
		>
			<div className={styles.sections}>
				<NameChangeSection />
				<PasswordChangeSection />
				<MFASection />
			</div>
		</ContentContainer>
	);
};

export { ProfilePage };
export default ProfilePage;
