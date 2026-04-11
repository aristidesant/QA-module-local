import { ActionIcon, Tooltip } from '@mantine/core';
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useColorSchemeStore } from '~/stores/colorSchemeStore';
import styles from './ColorSchemeToggle.module.css';

type ColorSchemePreference = 'light' | 'dark' | 'auto';

const iconMap: Record<ColorSchemePreference, typeof IconSun> = {
	light: IconSun,
	dark: IconMoon,
	auto: IconDeviceDesktop,
};

export const ColorSchemeToggle: React.FC<{ collapsed?: boolean }> = ({
	collapsed = false,
}) => {
	const { t } = useTranslation('common');
	const preference = useColorSchemeStore((s) => s.preference);
	const togglePreference = useColorSchemeStore((s) => s.togglePreference);

	const Icon = iconMap[preference];
	const label = t(`sidebar.theme.${preference}`);

	const button = (
		<ActionIcon
			variant='subtle'
			color='gray'
			size='sm'
			className={styles.toggle}
			onClick={togglePreference}
			aria-label={label}
		>
			<Icon size={16} />
		</ActionIcon>
	);

	if (collapsed) {
		return <Tooltip label={label}>{button}</Tooltip>;
	}

	return button;
};
