import styles from './Logo.module.css';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

interface LogoProps {
	animated?: boolean;
	compact?: boolean;
	size?: 'sm' | 'md' | 'lg';
	variant?: 'default' | 'compact';
	textOnly?: boolean;
}

const Logo: React.FC<LogoProps> = ({ compact = false, textOnly = false }) => {
	const navigate = useNavigate();
	const { t } = useTranslation('common');
	return (
		<button
			type='button'
			className={styles.logo}
			data-testid='logo'
			onClick={() => navigate('/')}
			aria-label={t('common.goToHome')}
		>
			{!textOnly && (
				<img
					className={`${styles.logoImage} ${compact ? styles.logoImageCompact : ''}`}
					src={
						compact ? '/images/logoonblack-small-nt.png' : '/images/logo-2.png'
					}
					alt='Logo'
				/>
			)}
			{(!compact || textOnly) && (
				<span className={styles.logoText}>
					Unified <span className={styles.logoAccent}>CXM</span>
				</span>
			)}
		</button>
	);
};

export default Logo;
