import { Stack, Text } from '@mantine/core';
import { IconGlobe } from '@tabler/icons-react';
import type { RegionalSettings } from '~/models/RegionalSettingsParam';
import styles from './RegionalSettingsParamsDetail.module.css';
import SectionCard from '~/components/SectionCard';

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
		{ label: 'Timezone', value: regionalSettings.timezone || '—' },
		{ label: 'Locale', value: regionalSettings.locale || '—' },
	];

	return (
		<Stack gap='xs' className={styles.cards}>
			{/* Regional Settings */}
			<SectionCard title='Configuration Details' icon={IconGlobe}>
				{renderDetails(regionalDetails)}
			</SectionCard>
		</Stack>
	);
};

export default RegionalSettingsParamsDetail;
