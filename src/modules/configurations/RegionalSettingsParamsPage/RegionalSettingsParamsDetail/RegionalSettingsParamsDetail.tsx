import { Stack, Text } from '@mantine/core';
import { IconFileText, IconGlobe } from '@tabler/icons-react';
import RightSectionCard from '~/components/RightSectionCard/RightSectionCard';
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
			<RightSectionCard
				title='Current Regional Settings'
				icon={IconFileText}
				iconColor='var(--mantine-color-blue-6)'
			>
				{renderDetails(regionalDetails)}
			</RightSectionCard>

			{/* Regional Settings */}
			<RightSectionCard
				title='Configuration Details'
				icon={IconGlobe}
				iconColor='var(--mantine-color-green-6)'
			>
				{renderDetails(regionalDetails)}
			</RightSectionCard>
		</Stack>
	);
};

export default RegionalSettingsParamsDetail;
