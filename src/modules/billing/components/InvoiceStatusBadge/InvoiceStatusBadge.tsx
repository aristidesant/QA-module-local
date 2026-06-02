import { Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { InvoiceStatus } from '~/models/InvoiceModel';

const STATUS_COLOR: Record<InvoiceStatus, string> = {
	DRAFT: 'gray',
	ISSUED: 'green',
	VOIDED: 'red',
};

interface InvoiceStatusBadgeProps {
	status: InvoiceStatus;
}

const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => {
	const { t } = useTranslation('billing');
	return (
		<Badge color={STATUS_COLOR[status]} variant='light' size='sm'>
			{t(`status.${status}`)}
		</Badge>
	);
};

export default InvoiceStatusBadge;
