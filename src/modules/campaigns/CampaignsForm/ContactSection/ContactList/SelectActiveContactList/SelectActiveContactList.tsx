import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface SelectActiveContactListProps {
	campaignId?: string | number;
	onClose: () => void;
	onRefresh: () => void;
	objectiveId?: number;
}

export const SelectActiveContactList = ({}: SelectActiveContactListProps) => {
	const { t } = useTranslation(['campaign.form.contacts', 'common']);
	// TODO: Implement SelectActiveContactList component
	return <Text>{t('form.contacts.list.selectActiveDescription')}</Text>;
};

export default SelectActiveContactList;
