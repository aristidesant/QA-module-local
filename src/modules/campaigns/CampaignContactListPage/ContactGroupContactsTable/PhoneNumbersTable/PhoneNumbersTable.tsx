import BaseTable from '~/components/BaseTable';
import { usePhoneNumbersColumns } from './usePhoneNumbersColumns';
import type { PhoneEntry } from '~/models/ContactsModel';

interface PhoneNumbersTableProps {
	phoneNumbers: PhoneEntry[];
}

function PhoneNumbersTable({ phoneNumbers }: PhoneNumbersTableProps) {
	const columns = usePhoneNumbersColumns();

	return (
		<BaseTable
			data={phoneNumbers}
			columns={columns}
			density='compact'
			emptyMessage='No phone numbers available'
		/>
	);
}

export default PhoneNumbersTable;
