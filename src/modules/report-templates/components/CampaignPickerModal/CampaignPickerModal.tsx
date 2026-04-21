import { useEffect } from 'react';
import { getErrorMessage } from '~/utils/httpClient';
import { useTranslation } from 'react-i18next';
import {
	Button,
	Checkbox,
	Group,
	Modal,
	Stack,
	Text,
	Select,
	Alert,
	Loader,
	Center,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconFileExport } from '@tabler/icons-react';
import { useGetCampaignsBySchemaId } from '~/queries/campaignContactSchemasQueries';
import { useGetSimpleCampaigns } from '~/queries/campaignsQueries';
import styles from './CampaignPickerModal.module.css';

export interface ExportData {
	startDate: string;
	endDate: string;
	campaignIds: number[];
	format: 'csv' | 'xlsx';
}

interface Campaign {
	id: number;
	name: string;
	description?: string | null;
	contactSchemaId?: number | null;
}

interface CampaignPickerModalProps {
	opened: boolean;
	onClose: () => void;
	templateId: number;
	templateSchemaId?: number | null;
	onSubmit: (data: ExportData) => Promise<void>;
	isSubmitting?: boolean;
}

const CampaignPickerModal = ({
	opened,
	onClose,
	templateSchemaId,
	onSubmit,
	isSubmitting = false,
}: CampaignPickerModalProps) => {
	const { t } = useTranslation('report-templates');

	const { data: schemaCampaigns = [], isLoading: isLoadingSchemaCampaigns } =
		useGetCampaignsBySchemaId(
			templateSchemaId ?? undefined,
			!!templateSchemaId
		);
	const { data: simpleCampaigns = [], isLoading: isLoadingSimpleCampaigns } =
		useGetSimpleCampaigns(!templateSchemaId);

	const campaigns = templateSchemaId ? schemaCampaigns : simpleCampaigns;
	const isLoadingCampaigns = templateSchemaId
		? isLoadingSchemaCampaigns
		: isLoadingSimpleCampaigns;

	const form = useForm<ExportData>({
		initialValues: {
			startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
				.toISOString()
				.split('T')[0],
			endDate: new Date().toISOString().split('T')[0],
			campaignIds: [],
			format: 'csv',
		},
		validate: {
			startDate: (value: string | null) =>
				!value ? t('export.validation.startDateRequired') : null,
			endDate: (value: string | null, values: { startDate: string }) => {
				if (!value) return t('export.validation.endDateRequired');
				if (values.startDate && new Date(value) < new Date(values.startDate)) {
					return t('export.validation.endDateBeforeStartDate');
				}
				return null;
			},
			campaignIds: (value: number[]) =>
				value.length === 0 ? t('export.validation.campaignIdsRequired') : null,
		},
	});

	useEffect(() => {
		if (!opened) {
			form.reset();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [opened]);

	const handleCampaignToggle = (campaignId: number) => {
		const current = form.values.campaignIds;
		const next = current.includes(campaignId)
			? current.filter((id) => id !== campaignId)
			: [...current, campaignId];
		form.setFieldValue('campaignIds', next);
	};

	const allSelected =
		campaigns.length > 0 && form.values.campaignIds.length === campaigns.length;
	const someSelected = form.values.campaignIds.length > 0 && !allSelected;

	const handleToggleAll = () => {
		form.setFieldValue(
			'campaignIds',
			allSelected ? [] : campaigns.map((c: Campaign) => c.id)
		);
	};

	const handleSubmit = async (values: ExportData) => {
		try {
			await onSubmit(values);
			onClose();
			form.reset();
		} catch (error) {
			notifications.show({
				message: getErrorMessage(error),
				color: 'red',
			});
		}
	};

	const formatOptions = [
		{ value: 'csv', label: t('export.formatCSV') },
		{ value: 'xlsx', label: t('export.formatXLSX') },
	];

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('export.title')}
			size='lg'
		>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='md'>
					{templateSchemaId && (
						<Alert
							icon={<IconAlertCircle size={16} />}
							title={t('export.schemaCompatibility')}
							color='blue'
							variant='light'
						>
							<Text size='sm'>
								{t('export.schemaCompatibilityDescription', {
									schemaId: templateSchemaId,
								})}
							</Text>
						</Alert>
					)}

					<Select
						label={t('export.format')}
						data={formatOptions}
						value={form.values.format}
						onChange={(value) =>
							form.setFieldValue('format', value as 'csv' | 'xlsx')
						}
						allowDeselect={false}
					/>

					<Group grow>
						<DatePickerInput
							label={t('export.startDate')}
							value={new Date(form.values.startDate)}
							onChange={(date) => {
								if (date) {
									const iso = new Date(date as Date | string)
										.toISOString()
										.split('T')[0];
									form.setFieldValue('startDate', iso);
								}
							}}
							error={form.errors.startDate}
							maxDate={new Date()}
						/>
						<DatePickerInput
							label={t('export.endDate')}
							value={new Date(form.values.endDate)}
							onChange={(date) => {
								if (date) {
									const iso = new Date(date as Date | string)
										.toISOString()
										.split('T')[0];
									form.setFieldValue('endDate', iso);
								}
							}}
							error={form.errors.endDate}
							maxDate={new Date()}
						/>
					</Group>

					<div>
						<Text fw={600} mb='sm'>
							{t('export.selectCampaigns')}
						</Text>
						<Stack gap='xs' className={styles.campaignList}>
							{isLoadingCampaigns ? (
								<Center py='xl'>
									<Loader size='sm' />
								</Center>
							) : campaigns.length === 0 ? (
								<Text c='dimmed' size='sm'>
									{templateSchemaId
										? t('export.noCompatibleCampaigns')
										: t('export.noCampaignsAvailable')}
								</Text>
							) : (
								<>
									<Group
										gap='sm'
										className={styles.campaignItem}
										onClick={handleToggleAll}
									>
										<Checkbox
											checked={allSelected}
											indeterminate={someSelected}
											onChange={handleToggleAll}
										/>
										<Text size='sm' fw={600}>
											{t('export.selectAll')}
										</Text>
									</Group>
									{campaigns.map((campaign: Campaign) => (
										<Group
											key={campaign.id}
											gap='sm'
											className={styles.campaignItem}
											onClick={() => handleCampaignToggle(campaign.id)}
										>
											<Checkbox
												checked={form.values.campaignIds.includes(campaign.id)}
												onChange={() => handleCampaignToggle(campaign.id)}
											/>
											<Stack gap={2} className={styles.campaignContent}>
												<Text size='sm' fw={500}>
													{campaign.name}
												</Text>
												{campaign.description && (
													<Text size='xs' c='dimmed'>
														{campaign.description}
													</Text>
												)}
											</Stack>
										</Group>
									))}
								</>
							)}
						</Stack>
						{form.errors.campaignIds && (
							<Text size='xs' c='red' mt='xs'>
								{form.errors.campaignIds}
							</Text>
						)}
					</div>

					{form.values.campaignIds.length > 0 && (
						<Alert
							icon={<IconFileExport size={16} />}
							color='green'
							variant='light'
						>
							<Text size='sm'>
								{t('export.selectedCount', {
									count: form.values.campaignIds.length,
								})}
							</Text>
						</Alert>
					)}

					<Group justify='flex-end' mt='md'>
						<Button variant='default' onClick={onClose}>
							{t('actions.cancel')}
						</Button>
						<Button type='submit' loading={isSubmitting}>
							{t('export.export')}
						</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
};

export default CampaignPickerModal;
