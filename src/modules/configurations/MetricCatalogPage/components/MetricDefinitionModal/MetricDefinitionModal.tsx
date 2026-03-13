import { memo } from 'react';
import { Modal, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { MetricDefinition } from '~/models/AnalyticsDashboard';
import type { MetricCatalogOption } from '../../MetricCatalogPage.types';
import useMetricCatalogStore from '../../store/useMetricCatalogStore';
import MetricDefinitionForm from '../MetricDefinitionForm';
import styles from './MetricDefinitionModal.module.css';

type MetricDefinitionModalProps = {
	metric: MetricDefinition | null;
	campaignOptions: MetricCatalogOption[];
};

const MetricDefinitionModal = ({
	metric,
	campaignOptions,
}: MetricDefinitionModalProps) => {
	const { t } = useTranslation('metric-catalog');
	const opened = useMetricCatalogStore((state) => state.modalOpened);
	const closeModal = useMetricCatalogStore((state) => state.closeModal);

	return (
		<Modal
			opened={opened}
			onClose={closeModal}
			centered
			size='xl'
			radius='lg'
			padding='xl'
			overlayProps={{ backgroundOpacity: 0.45, blur: 4 }}
			title={
				<div className={styles.modalHeader}>
					<Text className={styles.modalTitle}>
						{metric ? t('form.editTitle') : t('form.createTitle')}
					</Text>
					<Text className={styles.modalDescription}>
						{t('form.description')}
					</Text>
				</div>
			}
		>
			<MetricDefinitionForm
				key={metric?.id ?? 'new'}
				metric={metric}
				campaignOptions={campaignOptions}
				onCancel={closeModal}
				onSuccess={closeModal}
			/>
		</Modal>
	);
};

export default memo(MetricDefinitionModal);
