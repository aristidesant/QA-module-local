import { Badge } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { InvoiceStatus } from '~/models/InvoiceModel';
import classes from './InvoiceStatusBadge.module.css';

const STATUS_CONFIG: Record<
	InvoiceStatus,
	{ color: string; dotClass: string }
> = {
	DRAFT: { color: 'gray', dotClass: classes.dotDraft },
	ISSUED: { color: 'green', dotClass: classes.dotIssued },
	VOIDED: { color: 'red', dotClass: classes.dotVoided },
};

interface InvoiceStatusBadgeProps {
	status: InvoiceStatus;
}

const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => {
	const { t } = useTranslation('billing');
	const config = STATUS_CONFIG[status];

	return (
		<Badge
			color={config.color}
			variant='light'
			size='sm'
			leftSection={<span className={`${classes.dot} ${config.dotClass}`} />}
		>
			{t(`status.${status}`)}
		</Badge>
	);
};

export default InvoiceStatusBadge;
