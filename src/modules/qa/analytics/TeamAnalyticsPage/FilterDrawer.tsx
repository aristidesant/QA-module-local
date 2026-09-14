import { useTranslation } from 'react-i18next';
import { Loader, Stack, Text } from '@mantine/core';
import { AppDrawer } from '~/components/AppDrawer';

interface FilterDrawerProps {
	open: boolean;
	onClose: () => void;
}

export default function FilterDrawer({ open, onClose }: FilterDrawerProps) {
	const { t } = useTranslation('qa.teamAnalytics');

	return (
		<AppDrawer opened={open} onClose={onClose} title={t('filters.title')}>
			<Stack gap='md'>
				<Text size='sm' c='dimmed'>
					{t('common.comingSoon')}
				</Text>
				<Loader type='dots' />
			</Stack>
		</AppDrawer>
	);
}
