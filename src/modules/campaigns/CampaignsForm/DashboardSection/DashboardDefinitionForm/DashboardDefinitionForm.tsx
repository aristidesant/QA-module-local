import { useEffect } from 'react';
import {
	Button,
	Group,
	Select,
	Stack,
	Switch,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import type {
	CreateDashboardDto,
	DashboardDefinition,
	DashboardMainSlot,
	UpdateDashboardDto,
} from '~/models/AnalyticsDashboard';
import {
	useCreateDashboard,
	useUpdateDashboard,
} from '~/queries/analyticsDashboardsQueries';
import { getErrorMessage } from '~/utils/httpClient';
import {
	dashboardFormValues,
	getDashboardMainSlotLabel,
} from '../DashboardSection.helpers';
import type { DashboardFormValues } from '../DashboardSection.types';
import styles from './DashboardDefinitionForm.module.css';

type DashboardDefinitionFormProps = {
	campaignId: number | null;
	allowMainSlot?: boolean;
	dashboard?: DashboardDefinition | null;
	onCancel: () => void;
	onSuccess: (dashboardId?: number) => void;
};

const DashboardDefinitionForm = ({
	campaignId,
	allowMainSlot = false,
	dashboard,
	onCancel,
	onSuccess,
}: DashboardDefinitionFormProps) => {
	const { t } = useTranslation(['campaign.form.dashboards', 'common']);
	const createDashboard = useCreateDashboard();
	const updateDashboard = useUpdateDashboard();
	const isEditing = Boolean(dashboard?.id);
	const mainSlotValues: DashboardMainSlot[] = ['MAIN_1', 'MAIN_2', 'MAIN_3'];
	const mainSlotOptions: Array<{ value: DashboardMainSlot; label: string }> =
		mainSlotValues.map((mainSlot) => ({
			value: mainSlot,
			label: getDashboardMainSlotLabel(t, mainSlot),
		}));

	const form = useForm<DashboardFormValues>({
		initialValues: dashboardFormValues(dashboard),
		validate: {
			name: (value) =>
				value.trim()
					? null
					: t('dashboardBuilder.form.validation.dashboardName'),
		},
	});

	useEffect(() => {
		const nextValues = dashboardFormValues(dashboard);

		form.setValues(nextValues);
		form.resetDirty(nextValues);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dashboard]);

	const handleSubmit = form.onSubmit(async (values) => {
		const payload: CreateDashboardDto | UpdateDashboardDto = {
			campaignId,
			name: values.name.trim(),
			description: values.description.trim() || undefined,
			...(allowMainSlot ? { mainSlot: values.mainSlot } : {}),
			isDefault: values.isDefault,
		};

		try {
			const saved =
				isEditing && dashboard
					? await updateDashboard.mutateAsync({
							id: dashboard.id,
							data: payload,
						})
					: await createDashboard.mutateAsync(payload as CreateDashboardDto);

			notifications.show({
				title: isEditing
					? t('dashboardBuilder.notifications.dashboardUpdatedTitle')
					: t('dashboardBuilder.notifications.dashboardCreatedTitle'),
				message: isEditing
					? t('dashboardBuilder.notifications.dashboardUpdatedMessage')
					: t('dashboardBuilder.notifications.dashboardCreatedMessage'),
				color: 'green',
			});

			onSuccess(saved.id);
		} catch (error) {
			notifications.show({
				title: t('dashboardBuilder.notifications.errorTitle'),
				message: getErrorMessage(error),
				color: 'red',
			});
		}
	});

	return (
		<form onSubmit={handleSubmit} className={styles.modalForm}>
			<div className={styles.formSectionCard}>
				<div className={styles.formSectionCardHeader}>
					<Text fw={600} size='sm' className={styles.formSectionCardTitle}>
						{t('dashboardBuilder.form.sections.dashboardTitle')}
					</Text>
					<Text size='xs' className={styles.formSectionCardDescription}>
						{t('dashboardBuilder.form.sections.dashboardDescription')}
					</Text>
				</div>
				<Stack gap='sm'>
					<TextInput
						label={t('dashboardBuilder.form.fields.dashboardName')}
						{...form.getInputProps('name')}
					/>
					<Textarea
						label={t('dashboardBuilder.form.fields.dashboardDescription')}
						minRows={3}
						{...form.getInputProps('description')}
					/>
					{allowMainSlot ? (
						<Select
							clearable
							label={t('dashboardBuilder.form.fields.mainSlot')}
							description={t(
								'dashboardBuilder.form.fields.mainSlotDescription'
							)}
							placeholder={t('dashboardBuilder.form.placeholders.mainSlot')}
							data={mainSlotOptions}
							value={form.values.mainSlot}
							onChange={(value) =>
								form.setFieldValue(
									'mainSlot',
									value as DashboardMainSlot | null
								)
							}
						/>
					) : null}
				</Stack>
			</div>

			<div className={styles.formSectionCard}>
				<Switch
					label={t('dashboardBuilder.form.fields.isDefault')}
					checked={form.values.isDefault}
					onChange={(event) =>
						form.setFieldValue('isDefault', event.currentTarget.checked)
					}
				/>
			</div>

			<div className={styles.formFooter}>
				<Group justify='flex-end'>
					<Button variant='default' onClick={onCancel}>
						{t('dashboardBuilder.form.actions.cancel')}
					</Button>
					<Button
						type='submit'
						loading={createDashboard.isPending || updateDashboard.isPending}
					>
						{isEditing
							? t('dashboardBuilder.form.actions.saveDashboard')
							: t('dashboardBuilder.form.actions.createDashboard')}
					</Button>
				</Group>
			</div>
		</form>
	);
};

export default DashboardDefinitionForm;
