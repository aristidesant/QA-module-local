import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import { useCampaignsStore } from '~/stores/campaignsStore';
import { useCampaignFormContext } from '../../campaignFormFunctions';
import AnalyticsVariableEditor from './AnalyticsVariableEditor';
import AnalyticsVariablesTable from './AnalyticsVariablesTable';
import {
	AnalyticsFormProvider,
	createEmptyAnalyticsRow,
	getDataCollectionFromAgentConfig,
	mapRowsToDataCollection,
	normalizeDataCollectionRows,
	useAnalyticsForm,
} from './analyticsFormContext';

const AnalyticsSection = () => {
	const { t } = useTranslation('campaigns');
	const campaignForm = useCampaignFormContext();
	const { setRightComponent } = useCampaignsStore((state) => state);
	const lastRightPanelSignature = useRef<string | null>(null);
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
		const selectedRow = form.values.rows.find(
			(row) => row.id === form.values.selectedRowId
		);
		const nextSignature = selectedRow
			? `${selectedRow.id}-${JSON.stringify(selectedRow)}`
			: null;

		if (!selectedRow) {
			if (lastRightPanelSignature.current !== null) {
				lastRightPanelSignature.current = null;
				setRightComponent(null);
			}
			return;
		}

		if (lastRightPanelSignature.current === nextSignature) {
			return;
		}

		lastRightPanelSignature.current = nextSignature;

		setRightComponent(
			<AnalyticsFormProvider form={form}>
				<AnalyticsVariableEditor />
			</AnalyticsFormProvider>
		);
	}, [form.values.selectedRowId, form.values.rows, setRightComponent]);

	useEffect(() => {
		return () => {
			lastRightPanelSignature.current = null;
			setRightComponent(null);
		};
	}, [setRightComponent]);

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
		</AnalyticsFormProvider>
	);
};

export default AnalyticsSection;
