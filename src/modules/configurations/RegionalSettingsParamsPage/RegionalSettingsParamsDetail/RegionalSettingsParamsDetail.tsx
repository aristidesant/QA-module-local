import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { RegionalSettings } from '~/models/RegionalSettingsParam';
import styles from './RegionalSettingsParamsDetail.module.css';

interface RegionalSettingsParamsDetailProps {
	regionalSettings: RegionalSettings;
}

type Detail = {
	label: string;
	value: React.ReactNode;
};

const RegionalSettingsParamsDetail: React.FC<
	RegionalSettingsParamsDetailProps
> = ({ regionalSettings }) => {
	const { t } = useTranslation('regional-settings-params');

	const renderDetails = (items: Detail[]) => (
		<div className={styles.detailList}>
			{items.map((detail) => (
				<div key={detail.label} className={styles.detail}>
					<Text className={styles.detailLabel}>{detail.label}</Text>
					<div className={styles.detailValue}>{detail.value}</div>
				</div>
			))}
		</div>
	);

	const regionalDetails: Detail[] = [
		{ label: t('fields.timezone'), value: regionalSettings.timezone || '-' },
		{ label: t('fields.locale'), value: regionalSettings.locale || '-' },
	];

	return <div className={styles.cards}>{renderDetails(regionalDetails)}</div>;
};

export default RegionalSettingsParamsDetail;
