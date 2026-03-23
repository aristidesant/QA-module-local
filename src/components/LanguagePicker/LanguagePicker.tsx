import { Menu, UnstyledButton } from '@mantine/core';
import { IconCheck, IconChevronDown } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import styles from './LanguagePicker.module.css';

interface LanguagePickerProps {
	size?: 'xs' | 'sm' | 'md';
	variant?: 'subtle' | 'default';
	withLabel?: boolean;
}

const LanguagePicker: React.FC<LanguagePickerProps> = ({
	size = 'sm',
	variant = 'subtle',
	withLabel = true,
}) => {
	const { i18n, t } = useTranslation('common');

	const languages = [
		{ value: 'en', label: 'English', flag: '🇺🇸' },
		{ value: 'es', label: 'Español', flag: '🇪🇸' },
	];

	const currentLanguage =
		languages.find((l) => l.value === i18n.language) || languages[0];

	const handleLanguageChange = (value: string) => {
		i18n.changeLanguage(value);
	};

	return (
		<Menu
			shadow='md'
			width={160}
			position='bottom-end'
			radius='md'
			transitionProps={{ transition: 'fade', duration: 150 }}
		>
			<Menu.Target>
				<UnstyledButton
					className={[styles.trigger, styles[variant], styles[size]].join(' ')}
					aria-label={t('languages.' + i18n.language)}
				>
					<div className={styles.triggerContent}>
						<span className={styles.flag}>{currentLanguage.flag}</span>
						{withLabel && (
							<span className={styles.langValue}>{currentLanguage.label}</span>
						)}
						<IconChevronDown
							size={14}
							stroke={1.5}
							className={styles.chevron}
						/>
					</div>
				</UnstyledButton>
			</Menu.Target>

			<Menu.Dropdown className={styles.dropdown}>
				<Menu.Label className={styles.menuLabel}>
					{t('languages.title')}
				</Menu.Label>
				{languages.map((lang) => (
					<Menu.Item
						key={lang.value}
						onClick={() => handleLanguageChange(lang.value)}
						leftSection={<span className={styles.menuFlag}>{lang.flag}</span>}
						rightSection={
							i18n.language === lang.value && (
								<IconCheck size={14} color='var(--mantine-color-blue-6)' />
							)
						}
						className={[
							styles.menuItem,
							i18n.language === lang.value ? styles.activeItem : '',
						].join(' ')}
					>
						<span
							className={
								i18n.language === lang.value
									? styles.menuItemTextActive
									: styles.menuItemText
							}
						>
							{lang.label}
						</span>
					</Menu.Item>
				))}
			</Menu.Dropdown>
		</Menu>
	);
};

export default LanguagePicker;
