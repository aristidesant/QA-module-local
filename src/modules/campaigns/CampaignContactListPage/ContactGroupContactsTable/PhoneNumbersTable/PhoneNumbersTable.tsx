import BaseTable from '~/components/BaseTable';
import { usePhoneNumbersColumns } from './usePhoneNumbersColumns';
import type { PhoneEntry } from '~/models/ContactsModel';
import { useTranslation } from 'react-i18next';

interface PhoneNumbersTableProps {
	phoneNumbers: PhoneEntry[];
}

function PhoneNumbersTable({ phoneNumbers }: PhoneNumbersTableProps) {
	const { t } = useTranslation('campaigns');
	const columns = usePhoneNumbersColumns();

	return (
		<BaseTable
			data={phoneNumbers}
			columns={columns}
			density='compact'
			emptyMessage={t('contactListPage.phoneNumbersTable.empty')}
		/>
	);
}

export default PhoneNumbersTable;
