import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';
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
	const { t } = useTranslation(['campaign.form.analytics', 'common']);
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

	// Ref flag: when true, handleEditorClose skips its logic so the
	// delete-confirmation flow is not disrupted by Modal's onClose callback.
	const deletingRef = useRef(false);

	const handleEditorClose = useCallback(() => {
		// Skip cleanup when the editor is being closed as part of a delete request;
		// the delete flow manages its own state.
		if (deletingRef.current) return;

		const currentId = form.values.selectedRowId;
		if (currentId) {
			const selectedRow = form.values.rows.find((r) => r.id === currentId);
			const selectedIdx = form.values.rows.findIndex((r) => r.id === currentId);
			if (selectedRow?.isNew && selectedIdx >= 0) {
				form.removeListItem('rows', selectedIdx);
			}
		}
		form.setFieldValue('selectedRowId', null);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [form]);

	const handleAddRow = () => {
		const newRow = createEmptyAnalyticsRow();
		form.insertListItem('rows', newRow);
		form.setFieldValue('selectedRowId', newRow.id);
	};

	const [pendingDeleteRow, setPendingDeleteRow] = useState<{
		id: string;
		identifier: string;
	} | null>(null);

	const handleDeleteRequest = useCallback(
		(rowId: string, identifier: string) => {
			// Set the ref BEFORE closing the editor so that the Modal onClose
			// callback (handleEditorClose) is a no-op.
			deletingRef.current = true;
			form.setFieldValue('selectedRowId', null);

			// Defer showing the confirmation modal to the next frame so it
			// renders after the editor modal has fully processed its close.
			requestAnimationFrame(() => {
				setPendingDeleteRow({ id: rowId, identifier });
				deletingRef.current = false;
			});
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[form]
	);

	const handleDeleteConfirm = () => {
		if (!pendingDeleteRow) return;
		const idx = form.values.rows.findIndex((r) => r.id === pendingDeleteRow.id);
		if (idx >= 0) {
			form.removeListItem('rows', idx);
		}
		form.setFieldValue('selectedRowId', null);
		setPendingDeleteRow(null);
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
				<AnalyticsVariableEditor
					onClose={handleEditorClose}
					onDeleteRequest={handleDeleteRequest}
				/>
			</Modal>

			<Modal
				opened={pendingDeleteRow !== null}
				onClose={() => setPendingDeleteRow(null)}
				title={t('form.analytics.dialogs.systemDefault.title')}
				size='sm'
				centered
			>
				<Text size='sm'>
					{t('form.analytics.dialogs.systemDefault.body', {
						name: pendingDeleteRow?.identifier ?? '',
					})}
				</Text>
				<Group justify='flex-end' mt='md' gap='xs'>
					<Button
						size='sm'
						variant='default'
						onClick={() => setPendingDeleteRow(null)}
					>
						{t('form.analytics.dialogs.systemDefault.cancel')}
					</Button>
					<Button size='sm' color='red' onClick={handleDeleteConfirm}>
						{t('form.analytics.dialogs.systemDefault.confirm')}
					</Button>
				</Group>
			</Modal>
		</AnalyticsFormProvider>
	);
};

export default AnalyticsSection;
