import BaseTable from '~/components/BaseTable';
import { usePhoneNumbersColumns } from './usePhoneNumbersColumns';

interface PhoneNumber {
	phoneNumber: string;
	type?: string;
	status?: string;
	retries?: number;
}

interface PhoneNumbersTableProps {
	phoneNumbers: PhoneNumber[];
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
