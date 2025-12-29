import { Menu, UnstyledButton, Text, Group } from '@mantine/core';
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
					<Group gap={8} wrap='nowrap'>
						<Text size='lg' style={{ lineHeight: 1 }}>
							{currentLanguage.flag}
						</Text>
						{withLabel && (
							<Text size='sm' fw={600} className={styles.langValue}>
								{currentLanguage.label}
							</Text>
						)}
						<IconChevronDown
							size={14}
							stroke={1.5}
							className={styles.chevron}
						/>
					</Group>
				</UnstyledButton>
			</Menu.Target>

			<Menu.Dropdown className={styles.dropdown}>
				<Menu.Label className={styles.menuLabel}>
					{t('languages.title', { defaultValue: 'SELECT LANGUAGE' })}
				</Menu.Label>
				{languages.map((lang) => (
					<Menu.Item
						key={lang.value}
						onClick={() => handleLanguageChange(lang.value)}
						leftSection={
							<Text size='md' style={{ width: 20 }}>
								{lang.flag}
							</Text>
						}
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
						<Text size='sm' fw={i18n.language === lang.value ? 600 : 400}>
							{lang.label}
						</Text>
					</Menu.Item>
				))}
			</Menu.Dropdown>
		</Menu>
	);
};

export default LanguagePicker;
