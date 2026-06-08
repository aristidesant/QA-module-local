import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
	Button,
	Checkbox,
	Group,
	NumberInput,
	Radio,
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
import {
	IconInfoCircle,
	IconAlertTriangle,
	IconCircleCheck,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import SectionCard from '~/components/SectionCard';
import { MASTER_CLIENT_ID } from '~/constants/client';
import { useGetAllClients } from '~/queries/clientQueries';
import { usePreviewInvoice, useCreateInvoice } from '~/queries/invoiceQueries';
import type {
	InvoicePreviewResponse,
	InvoiceStatus,
	InvoiceCurrency,
	CreateInvoiceDto,
} from '~/models/InvoiceModel';
import {
	EMPTY_VALUE,
	formatInvoicePeriod,
	getClientOptionLabel,
} from '~/modules/billing/utils';
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
			issuerClientId: String(MASTER_CLIENT_ID),
			receiverClientId: '',
			periodStart: null,
			periodEnd: null,
			invoiceNumber: '',
			currency: 'DOP',
			taxRate: 18,
			hourlyRate: 0,
		},
		validate: {
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

	const selectedIssuerLabel = getClientOptionLabel(
		clients,
		form.values.issuerClientId
	);
	const selectedReceiverLabel = getClientOptionLabel(
		clients,
		form.values.receiverClientId
	);

	const setupSummary = (
		<SectionCard title={t('new.sections.summary')} padding='sm'>
			<Stack gap='xs'>
				<Group justify='space-between'>
					<Text size='sm' c='dimmed'>
						{t('new.summary.issuer')}
					</Text>
					<Text size='sm' fw={500}>
						{selectedIssuerLabel}
					</Text>
				</Group>
				<Group justify='space-between'>
					<Text size='sm' c='dimmed'>
						{t('new.summary.receiver')}
					</Text>
					<Text size='sm' fw={500}>
						{selectedReceiverLabel}
					</Text>
				</Group>
				<Group justify='space-between'>
					<Text size='sm' c='dimmed'>
						{t('new.summary.period')}
					</Text>
					<Text size='sm' fw={500}>
						{formatInvoicePeriod(
							form.values.periodStart,
							form.values.periodEnd
						)}
					</Text>
				</Group>
				<Group justify='space-between'>
					<Text size='sm' c='dimmed'>
						{t('new.summary.currency')}
					</Text>
					<Text size='sm' fw={500}>
						{form.values.currency}
					</Text>
				</Group>
				<Group justify='space-between'>
					<Text size='sm' c='dimmed'>
						{t('new.summary.taxRate')}
					</Text>
					<Text size='sm' fw={500}>
						{form.values.taxRate}%
					</Text>
				</Group>
				<Group justify='space-between'>
					<Text size='sm' c='dimmed'>
						{t('new.summary.hourlyRate')}
					</Text>
					<Text size='sm' fw={500}>
						{form.values.hourlyRate}
					</Text>
				</Group>
			</Stack>
		</SectionCard>
	);

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
				title: t('notifications.previewFailed.title'),
				message: t('notifications.previewFailed.message'),
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
					title: t('notifications.createConflict.title'),
					message: t('notifications.createConflict.message'),
					color: 'yellow',
				});
				void handlePreview();
			} else {
				notifications.show({
					title: t('notifications.createFailed.title'),
					message: t('notifications.createFailed.message'),
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
		<ContentContainer
			title={t('new.title')}
			description={t('new.sections.reviewDescription')}
		>
			<div className={classes.root}>
				<SectionCard padding='sm'>
					<Stepper active={active} onStepClick={setActive} size='sm'>
						<Stepper.Step label={t('new.steps.parameters')} />
						<Stepper.Step label={t('new.steps.preview')} />
						<Stepper.Step label={t('new.steps.confirm')} />
					</Stepper>
				</SectionCard>

				{active === 0 && (
					<Stack gap='md'>
						<div className={classes.createLayout}>
							<Stack gap='md'>
								<SectionCard title={t('new.sections.parties')} padding='sm'>
									<div className={classes.formGrid}>
										<Select
											label={t('new.form.issuerClient.label')}
											description={t('new.form.issuerClient.description')}
											placeholder={t('new.form.issuerClient.placeholder')}
											data={clientOptions}
											searchable
											disabled
											size='sm'
											{...form.getInputProps('issuerClientId')}
										/>
										<Select
											label={t('new.form.receiverClient.label')}
											description={t('new.form.receiverClient.description')}
											placeholder={t('new.form.receiverClient.placeholder')}
											data={clientOptions}
											searchable
											size='sm'
											{...form.getInputProps('receiverClientId')}
										/>
									</div>
								</SectionCard>

								<SectionCard title={t('new.sections.period')} padding='sm'>
									<div className={classes.formGrid}>
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
									</div>
								</SectionCard>

								<SectionCard title={t('new.sections.identity')} padding='sm'>
									<TextInput
										label={t('new.form.invoiceNumber.label')}
										placeholder={t('new.form.invoiceNumber.placeholder')}
										size='sm'
										{...form.getInputProps('invoiceNumber')}
									/>
								</SectionCard>

								<SectionCard title={t('new.sections.financials')} padding='sm'>
									<div className={classes.formGrid}>
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
								</SectionCard>
							</Stack>

							<aside className={classes.summaryAside}>{setupSummary}</aside>
						</div>
						<div className={classes.actions}>
							<Button
								variant='subtle'
								onClick={() => navigate('/billing/invoices')}
							>
								{t('new.actions.cancel')}
							</Button>
							<Button
								onClick={() => void handlePreview()}
								loading={previewMutation.isPending}
							>
								{t('new.actions.preview')}
							</Button>
						</div>
					</Stack>
				)}

				{active === 1 && (
					<Stack gap='md'>
						<div>
							<Text size='lg' fw={600}>
								{t('new.sections.review')}
							</Text>
							<Text size='sm' c='dimmed' mt={4}>
								{t('new.sections.reviewDescription')}
							</Text>
						</div>

						{preview?.snapshot.calculationWarnings &&
							preview.snapshot.calculationWarnings.length > 0 && (
								<SectionCard
									icon={IconAlertTriangle}
									title={t('new.warnings.title')}
									headerAccent='yellow'
									padding='sm'
								>
									<Stack gap='xs'>
										{preview.snapshot.calculationWarnings.map((w, i) => (
											<Text key={i} size='sm'>
												{w}
											</Text>
										))}
									</Stack>
								</SectionCard>
							)}

						{preview?.hasActiveInvoiceConflict &&
							preview.activeInvoiceConflict && (
								<SectionCard
									icon={IconInfoCircle}
									title={t('new.conflict.title')}
									headerAccent='red'
									padding='sm'
								>
									<Stack gap='sm'>
										<Text size='sm'>{t('new.conflict.description')}</Text>
										<Text size='sm'>
											<strong>
												#{preview.activeInvoiceConflict.invoiceNumber}
											</strong>{' '}
											- {preview.activeInvoiceConflict.status} (
											{preview.activeInvoiceConflict.periodStart} -{' '}
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
												placeholder={t('new.conflict.replaceReasonPlaceholder')}
												value={replaceReason}
												onChange={(e) =>
													setReplaceReason(e.currentTarget.value)
												}
												minRows={2}
											/>
										)}
									</Stack>
								</SectionCard>
							)}

						{preview?.snapshot && (
							<InvoiceSnapshotCard snapshot={preview.snapshot} />
						)}

						<div className={classes.actions}>
							<Button
								variant='subtle'
								onClick={() => navigate('/billing/invoices')}
							>
								{t('new.actions.cancel')}
							</Button>
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
				)}

				{active === 2 && (
					<Stack gap='md'>
						<div>
							<div className={classes.confirmHeader}>
								<div className={classes.confirmIcon}>
									<IconCircleCheck size={20} />
								</div>
								<div>
									<Text size='lg' fw={600}>
										{t('new.sections.confirmTitle')}
									</Text>
									<Text size='sm' c='dimmed'>
										{t('new.sections.confirmDescription')}
									</Text>
								</div>
							</div>
						</div>

						<div className={classes.confirmLayout}>
							<SectionCard
								title={t('new.sections.invoiceDetails')}
								padding='sm'
							>
								<div className={classes.detailGrid}>
									<div className={classes.detailItem}>
										<span className={classes.detailLabel}>
											{t('new.summary.issuer')}
										</span>
										<span className={classes.detailValue}>
											{selectedIssuerLabel}
										</span>
									</div>
									<div className={classes.detailItem}>
										<span className={classes.detailLabel}>
											{t('new.summary.receiver')}
										</span>
										<span className={classes.detailValue}>
											{selectedReceiverLabel}
										</span>
									</div>
									<div className={classes.detailItem}>
										<span className={classes.detailLabel}>
											{t('new.summary.period')}
										</span>
										<span className={classes.detailValue}>
											{formatInvoicePeriod(
												form.values.periodStart,
												form.values.periodEnd
											)}
										</span>
									</div>
									<div className={classes.detailItem}>
										<span className={classes.detailLabel}>
											{t('new.summary.invoiceNumber')}
										</span>
										<span className={classes.detailValue}>
											{form.values.invoiceNumber}
										</span>
									</div>
									<div className={classes.detailItem}>
										<span className={classes.detailLabel}>
											{t('new.summary.currency')}
										</span>
										<span className={classes.detailValue}>
											{form.values.currency}
										</span>
									</div>
									<div className={classes.detailItem}>
										<span className={classes.detailLabel}>
											{t('new.summary.taxRate')}
										</span>
										<span className={classes.detailValue}>
											{form.values.taxRate}%
										</span>
									</div>
									<div className={classes.detailItem}>
										<span className={classes.detailLabel}>
											{t('new.summary.hourlyRate')}
										</span>
										<span className={classes.detailValue}>
											{preview?.snapshot.invoice.hourlyRateFormatted ??
												`$${form.values.hourlyRate}`}
										</span>
									</div>
									<div className={classes.detailItem}>
										<span className={classes.detailLabel}>
											{t('new.summary.subtotal')}
										</span>
										<span className={classes.detailValue}>
											{preview?.snapshot.totals.subtotalFormatted ??
												EMPTY_VALUE}
										</span>
									</div>
								</div>
								<div className={classes.totalRow}>
									<span className={classes.totalLabel}>
										{t('new.summary.total')}
									</span>
									<span className={classes.totalValue}>
										{preview?.snapshot.totals.totalFormatted ?? EMPTY_VALUE}
									</span>
								</div>
							</SectionCard>

							<SectionCard title={t('new.statusLabel')} padding='sm'>
								<Stack gap='sm'>
									<div
										className={`${classes.statusOption} ${invoiceStatus === 'DRAFT' ? classes.statusOptionChecked : ''}`}
										onClick={() => setInvoiceStatus('DRAFT')}
									>
										<Radio
											checked={invoiceStatus === 'DRAFT'}
											onChange={() => setInvoiceStatus('DRAFT')}
										/>
										<div>
											<Text size='sm' fw={600}>
												{t('new.statusDraft')}
											</Text>
											<Text size='xs' c='dimmed' mt={2}>
												{t('new.summary.draftDescription')}
											</Text>
										</div>
									</div>
									<div
										className={`${classes.statusOption} ${invoiceStatus === 'ISSUED' ? classes.statusOptionChecked : ''}`}
										onClick={() => setInvoiceStatus('ISSUED')}
									>
										<Radio
											checked={invoiceStatus === 'ISSUED'}
											onChange={() => setInvoiceStatus('ISSUED')}
										/>
										<div>
											<Text size='sm' fw={600}>
												{t('new.statusIssued')}
											</Text>
											<Text size='xs' c='dimmed' mt={2}>
												{t('new.summary.issuedDescription')}
											</Text>
										</div>
									</div>
								</Stack>
							</SectionCard>
						</div>

						<div className={classes.actions}>
							<Button
								variant='subtle'
								onClick={() => navigate('/billing/invoices')}
							>
								{t('new.actions.cancel')}
							</Button>
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
				)}
			</div>
		</ContentContainer>
	);
};

export default InvoiceNewPage;
