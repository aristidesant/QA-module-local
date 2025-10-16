import { Text, Image } from '@mantine/core';
import styles from './Logo.module.css';
import { useNavigate } from 'react-router';

interface LogoProps {
	animated?: boolean;
	compact?: boolean;
	size?: 'sm' | 'md' | 'lg';
	variant?: 'default' | 'compact';
}

const Logo: React.FC<LogoProps> = ({ compact = false }) => {
	const navigate = useNavigate();
	return (
		<div
			className={styles.logo}
			data-testid='logo'
			onClick={() => navigate('/')}
		>
			<Image
				src={
					compact ? '/images/logoonblack-small-nt.png' : '/images/logo-2.png'
				}
				alt='Logo'
				w={compact ? 32 : 120}
				h={compact ? 32 : 40}
			/>
			{!compact && (
				<Text className={styles.logoText}>
					Unified <span className={styles.logoAccent}>CXM</span>
				</Text>
			)}
		</div>
	);
};

export default Logo;
