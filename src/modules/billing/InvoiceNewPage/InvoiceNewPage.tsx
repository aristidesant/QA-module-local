import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
	Alert,
	Button,
	Checkbox,
	Group,
	NumberInput,
	SegmentedControl,
	Select,
	Stack,
	Stepper,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconInfoCircle, IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import SectionCard from '~/components/SectionCard';
import { useGetAllClients } from '~/queries/clientQueries';
import { usePreviewInvoice, useCreateInvoice } from '~/queries/invoiceQueries';
import type {
	InvoicePreviewResponse,
	InvoiceStatus,
	InvoiceCurrency,
	CreateInvoiceDto,
} from '~/models/InvoiceModel';
import InvoiceSnapshotCard from '../components/InvoiceSnapshotCard';
import classes from './InvoiceNewPage.module.css';

interface FormValues {
	issuerClientId: string;
	receiverClientId: string;
	periodStart: string | null;
	periodEnd: string | null;
	invoiceNumber: string;
	currency: InvoiceCurrency;
	taxRate: number;
	hourlyRate: number;
}

const InvoiceNewPage: React.FC = () => {
	const { t } = useTranslation('billing');
	const navigate = useNavigate();

	const [active, setActive] = useState(0);
	const [preview, setPreview] = useState<InvoicePreviewResponse | null>(null);
	const [replaceExisting, setReplaceExisting] = useState(false);
	const [replaceReason, setReplaceReason] = useState('');
	const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>('DRAFT');

	const { data: clients = [] } = useGetAllClients();
	const previewMutation = usePreviewInvoice();
	const createMutation = useCreateInvoice();

	const clientOptions = clients.map((c) => ({
		value: String(c.id),
		label: c.name,
	}));

	const form = useForm<FormValues>({
		initialValues: {
			issuerClientId: '',
			receiverClientId: '',
			periodStart: null,
			periodEnd: null,
			invoiceNumber: '',
			currency: 'DOP',
			taxRate: 18,
			hourlyRate: 0,
		},
		validate: {
			issuerClientId: (v) => (!v ? t('new.validation.issuerRequired') : null),
			receiverClientId: (v) =>
				!v ? t('new.validation.receiverRequired') : null,
			periodStart: (v) => (!v ? t('new.validation.periodStartRequired') : null),
			periodEnd: (v) => (!v ? t('new.validation.periodEndRequired') : null),
			invoiceNumber: (v) =>
				!v.trim() ? t('new.validation.invoiceNumberRequired') : null,
			hourlyRate: (v) => (v < 0 ? t('new.validation.hourlyRateMin') : null),
			taxRate: (v) =>
				v < 0 || v > 100 ? t('new.validation.taxRateRange') : null,
		},
	});

	const handlePreview = useCallback(async () => {
		const result = form.validate();
		if (result.hasErrors) return;

		const v = form.values;
		try {
			const data = await previewMutation.mutateAsync({
				issuerClientId: Number(v.issuerClientId),
				receiverClientId: Number(v.receiverClientId),
				periodStart: v.periodStart ?? '',
				periodEnd: v.periodEnd ?? '',
				invoiceNumber: v.invoiceNumber,
				currency: v.currency,
				taxRate: v.taxRate,
				hourlyRate: v.hourlyRate,
			});
			setPreview(data);
			setReplaceExisting(false);
			setReplaceReason('');
			setActive(1);
		} catch {
			notifications.show({
				title: 'Error',
				message: 'Failed to preview invoice.',
				color: 'red',
			});
		}
	}, [form, previewMutation]);

	const handleCreate = useCallback(async () => {
		if (!preview) return;
		const v = form.values;

		const dto: CreateInvoiceDto = {
			issuerClientId: Number(v.issuerClientId),
			receiverClientId: Number(v.receiverClientId),
			periodStart: v.periodStart ?? '',
			periodEnd: v.periodEnd ?? '',
			invoiceNumber: v.invoiceNumber,
			currency: v.currency,
			taxRate: v.taxRate,
			hourlyRate: v.hourlyRate,
			status: invoiceStatus,
		};

		if (replaceExisting && preview.activeInvoiceConflict) {
			dto.replaceExisting = true;
			dto.replacesInvoiceId = preview.activeInvoiceConflict.id;
			dto.replaceReason = replaceReason;
		}

		try {
			const created = await createMutation.mutateAsync(dto);
			notifications.show({
				title: t('notifications.created.title'),
				message: t('notifications.created.message', {
					number: created.invoiceNumber,
				}),
				color: 'green',
			});
			void navigate(`/billing/invoices/${created.id}`);
		} catch (err) {
			const status = (err as { response?: { status?: number } }).response
				?.status;
			if (status === 409) {
				notifications.show({
					title: 'Conflict',
					message: 'A conflict was detected. Refreshing preview.',
					color: 'yellow',
				});
				void handlePreview();
			} else {
				notifications.show({
					title: 'Error',
					message: 'Failed to create invoice.',
					color: 'red',
				});
			}
		}
	}, [
		preview,
		form,
		invoiceStatus,
		replaceExisting,
		replaceReason,
		createMutation,
		navigate,
		t,
		handlePreview,
	]);

	return (
		<ContentContainer>
			<div className={classes.root}>
				<SectionCard title={t('new.title')}>
					<div className={classes.stepperWrapper}>
						<Stepper active={active} onStepClick={setActive}>
							<Stepper.Step label={t('new.steps.parameters')}>
								<Stack gap='md' mt='md'>
									<div className={classes.formGrid}>
										<Select
											label={t('new.form.issuerClient.label')}
											placeholder={t('new.form.issuerClient.placeholder')}
											data={clientOptions}
											searchable
											size='sm'
											{...form.getInputProps('issuerClientId')}
										/>
										<Select
											label={t('new.form.receiverClient.label')}
											placeholder={t('new.form.receiverClient.placeholder')}
											data={clientOptions}
											searchable
											size='sm'
											{...form.getInputProps('receiverClientId')}
										/>
										<DateInput
											label={t('new.form.periodStart.label')}
											size='sm'
											clearable
											{...form.getInputProps('periodStart')}
										/>
										<DateInput
											label={t('new.form.periodEnd.label')}
											size='sm'
											clearable
											{...form.getInputProps('periodEnd')}
										/>
										<TextInput
											label={t('new.form.invoiceNumber.label')}
											placeholder={t('new.form.invoiceNumber.placeholder')}
											size='sm'
											{...form.getInputProps('invoiceNumber')}
										/>
										<div>
											<Text size='sm' fw={500} mb={4}>
												{t('new.form.currency.label')}
											</Text>
											<SegmentedControl
												data={['USD', 'DOP']}
												value={form.values.currency}
												onChange={(v) =>
													form.setFieldValue('currency', v as InvoiceCurrency)
												}
												size='sm'
											/>
										</div>
										<NumberInput
											label={t('new.form.taxRate.label')}
											min={0}
											max={100}
											size='sm'
											{...form.getInputProps('taxRate')}
										/>
										<NumberInput
											label={t('new.form.hourlyRate.label')}
											min={0}
											size='sm'
											{...form.getInputProps('hourlyRate')}
										/>
									</div>
									<div className={classes.actions}>
										<Button
											onClick={() => void handlePreview()}
											loading={previewMutation.isPending}
										>
											{t('new.actions.preview')}
										</Button>
									</div>
								</Stack>
							</Stepper.Step>

							<Stepper.Step label={t('new.steps.preview')}>
								<Stack gap='md' mt='md'>
									{preview?.snapshot.calculationWarnings &&
										preview.snapshot.calculationWarnings.length > 0 && (
											<Alert
												icon={<IconAlertTriangle size={18} />}
												color='yellow'
												title={t('new.warnings.title')}
											>
												<Stack gap='xs'>
													{preview.snapshot.calculationWarnings.map((w, i) => (
														<Text key={i} size='sm'>
															{w}
														</Text>
													))}
												</Stack>
											</Alert>
										)}

									{preview?.hasActiveInvoiceConflict &&
										preview.activeInvoiceConflict && (
											<Alert
												icon={<IconInfoCircle size={18} />}
												color='red'
												title={t('new.conflict.title')}
											>
												<Stack gap='sm'>
													<Text size='sm'>{t('new.conflict.description')}</Text>
													<Text size='sm'>
														<strong>
															#{preview.activeInvoiceConflict.invoiceNumber}
														</strong>{' '}
														— {preview.activeInvoiceConflict.status} (
														{preview.activeInvoiceConflict.periodStart} –{' '}
														{preview.activeInvoiceConflict.periodEnd})
													</Text>
													<Checkbox
														label={t('new.conflict.replaceLabel')}
														checked={replaceExisting}
														onChange={(e) =>
															setReplaceExisting(e.currentTarget.checked)
														}
													/>
													{replaceExisting && (
														<Textarea
															label={t('new.conflict.replaceReasonLabel')}
															placeholder={t(
																'new.conflict.replaceReasonPlaceholder'
															)}
															value={replaceReason}
															onChange={(e) =>
																setReplaceReason(e.currentTarget.value)
															}
															minRows={2}
														/>
													)}
												</Stack>
											</Alert>
										)}

									{preview?.snapshot && (
										<InvoiceSnapshotCard snapshot={preview.snapshot} />
									)}

									<div className={classes.actions}>
										<Button variant='default' onClick={() => setActive(0)}>
											{t('new.actions.back')}
										</Button>
										<Button
											onClick={() => setActive(2)}
											disabled={
												!!(
													preview?.hasActiveInvoiceConflict &&
													(!replaceExisting || !replaceReason.trim())
												)
											}
										>
											{t('new.actions.continue')}
										</Button>
									</div>
								</Stack>
							</Stepper.Step>

							<Stepper.Step label={t('new.steps.confirm')}>
								<Stack gap='md' mt='md'>
									<SectionCard padding='sm'>
										<Stack gap='xs'>
											<Group justify='space-between'>
												<Text size='sm' c='dimmed'>
													{t('new.summary.period')}
												</Text>
												<Text size='sm'>
													{form.values.periodStart} – {form.values.periodEnd}
												</Text>
											</Group>
											<Group justify='space-between'>
												<Text size='sm' c='dimmed'>
													{t('new.summary.invoiceNumber')}
												</Text>
												<Text size='sm'>{form.values.invoiceNumber}</Text>
											</Group>
											<Group justify='space-between'>
												<Text size='sm' c='dimmed'>
													{t('new.summary.total')}
												</Text>
												<Text size='sm' fw={600}>
													{preview?.snapshot.totals.totalFormatted ?? '—'}
												</Text>
											</Group>
										</Stack>
									</SectionCard>

									<div>
										<Text size='sm' fw={500} mb={4}>
											{t('new.statusLabel')}
										</Text>
										<SegmentedControl
											data={[
												{ value: 'DRAFT', label: t('new.statusDraft') },
												{ value: 'ISSUED', label: t('new.statusIssued') },
											]}
											value={invoiceStatus}
											onChange={(v) => setInvoiceStatus(v as InvoiceStatus)}
											size='sm'
										/>
									</div>

									<div className={classes.actions}>
										<Button variant='default' onClick={() => setActive(1)}>
											{t('new.actions.back')}
										</Button>
										<Button
											onClick={() => void handleCreate()}
											loading={createMutation.isPending}
										>
											{createMutation.isPending
												? t('new.actions.creating')
												: t('new.actions.create')}
										</Button>
									</div>
								</Stack>
							</Stepper.Step>
						</Stepper>
					</div>
				</SectionCard>
			</div>
		</ContentContainer>
	);
};

export default InvoiceNewPage;
