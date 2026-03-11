import { useEffect } from 'react';
import { Modal, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { useCampaignFormContext } from '../../../campaignFormFunctions';
import AnalyticsVariableEditor from '../AnalyticsVariableEditor';
import AnalyticsVariablesTable from '../AnalyticsVariablesTable';
import {
	AnalyticsFormProvider,
	createEmptyAnalyticsRow,
	getDataCollectionFromAgentConfig,
	mapRowsToDataCollection,
	normalizeDataCollectionRows,
	useAnalyticsForm,
} from '../analyticsFormContext';

const AnalyticsSection = () => {
	const { t } = useTranslation('campaigns');
	const campaignForm = useCampaignFormContext();
	const setRightComponent = useCampaignsStore(
		(state) => state.setRightComponent
	);
	const initialRows = normalizeDataCollectionRows(
		getDataCollectionFromAgentConfig(campaignForm.values.agentConfig)
	);

	const form = useAnalyticsForm({
		initialValues: {
			rows: initialRows,
			selectedRowId: null,
		},
	});

	useEffect(() => {
		const mappedDataCollection = mapRowsToDataCollection(form.values.rows);
		const currentDataCollection = getDataCollectionFromAgentConfig(
			campaignForm.values.agentConfig
		);

		if (
			JSON.stringify(currentDataCollection) ===
			JSON.stringify(mappedDataCollection)
		) {
			return;
		}

		campaignForm.setFieldValue(
			'agentConfig.dataCollection',
			mappedDataCollection
		);
		campaignForm.setFieldValue(
			'agentConfig.platformSettings.dataCollection',
			mappedDataCollection
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form.values.rows]);

	useEffect(() => {
		setRightComponent(null);
		return () => setRightComponent(null);
	}, [setRightComponent]);

	const handleEditorClose = () => {
		const currentId = form.values.selectedRowId;
		if (currentId) {
			const selectedRow = form.values.rows.find((r) => r.id === currentId);
			const selectedIdx = form.values.rows.findIndex((r) => r.id === currentId);
			if (selectedRow?.isNew && selectedIdx >= 0) {
				form.removeListItem('rows', selectedIdx);
			}
		}
		form.setFieldValue('selectedRowId', null);
	};

	const handleAddRow = () => {
		const newRow = createEmptyAnalyticsRow();
		form.insertListItem('rows', newRow);
		form.setFieldValue('selectedRowId', newRow.id);
	};

	return (
		<AnalyticsFormProvider form={form}>
			<SectionCard
				title={t('form.analytics.title')}
				description={t('form.analytics.description')}
			>
				<AnalyticsVariablesTable onAddRow={handleAddRow} />
			</SectionCard>

			<Modal
				opened={form.values.selectedRowId !== null}
				onClose={handleEditorClose}
				title={
					<Stack gap={0}>
						<Text size='sm' fw={600}>
							{t('form.analytics.editor.title')}
						</Text>
						<Text size='xs' c='dimmed'>
							{t('form.analytics.editor.description')}
						</Text>
					</Stack>
				}
				size='xl'
			>
				<AnalyticsVariableEditor onClose={handleEditorClose} />
			</Modal>
		</AnalyticsFormProvider>
	);
};

export default AnalyticsSection;
