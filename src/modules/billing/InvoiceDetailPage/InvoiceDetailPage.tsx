import { useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
	Alert,
	Badge,
	Button,
	Center,
	Divider,
	Group,
	Loader,
	Stack,
	Text,
	Textarea,
	Title,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import {
	IconArrowLeft,
	IconBan,
	IconCheck,
	IconDownload,
	IconInfoCircle,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import SectionCard from '~/components/SectionCard';
import {
	useGetInvoice,
	useIssueInvoice,
	useVoidInvoice,
	useDownloadInvoice,
} from '~/queries/invoiceQueries';
import {
	formatInvoiceDate,
	formatInvoiceDateTime,
	formatInvoicePeriod,
	getInvoiceSubtotalDisplay,
	getInvoiceTaxDisplay,
	getInvoiceTotalDisplay,
} from '~/modules/billing/utils';
import InvoiceStatusBadge from '../components/InvoiceStatusBadge';
import InvoiceSnapshotCard from '../components/InvoiceSnapshotCard';
import classes from './InvoiceDetailPage.module.css';

const InvoiceDetailPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const { t } = useTranslation('billing');
	const navigate = useNavigate();

	const invoiceId = Number(id);
	const { data: invoice, isLoading, isError, error } = useGetInvoice(invoiceId);
	const issueMutation = useIssueInvoice();
	const voidMutation = useVoidInvoice();
	const downloadMutation = useDownloadInvoice();
	const [isDownloading, setIsDownloading] = useState(false);

	const handleIssue = useCallback(() => {
		modals.openConfirmModal({
			title: t('detail.actions.issue'),
			centered: true,
			children: <Text size='sm'>{t('detail.actions.issueConfirm')}</Text>,
			labels: {
				confirm: t('detail.actions.issue'),
				cancel: t('actions.cancel', { ns: 'common' }),
			},
			confirmProps: { color: 'green' },
			onConfirm: async () => {
				try {
					const updated = await issueMutation.mutateAsync(invoiceId);
					notifications.show({
						title: t('notifications.issued.title'),
						message: t('notifications.issued.message', {
							number: updated.invoiceNumber,
						}),
						color: 'green',
					});
				} catch {
					notifications.show({
						title: t('notifications.issueFailed.title'),
						message: t('notifications.issueFailed.message'),
						color: 'red',
					});
				}
			},
		});
	}, [issueMutation, invoiceId, t]);

	const handleVoid = useCallback(() => {
		let reason = '';
		modals.openConfirmModal({
			title: t('detail.actions.voidTitle'),
			centered: true,
			closeOnConfirm: false,
			children: (
				<div>
					<Text size='sm' mb='sm'>
						{t('detail.actions.voidDescription')}
					</Text>
					<Textarea
						label={t('detail.actions.voidReasonLabel')}
						placeholder={t('detail.actions.voidReasonPlaceholder')}
						minRows={3}
						onChange={(e) => {
							reason = e.currentTarget.value;
						}}
					/>
				</div>
			),
			labels: {
				confirm: t('detail.actions.voidConfirm'),
				cancel: t('actions.cancel', { ns: 'common' }),
			},
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				if (!reason.trim()) {
					notifications.show({
						title: t('notifications.voidReasonRequired.title'),
						message: t('notifications.voidReasonRequired.message'),
						color: 'red',
					});
					return;
				}
				try {
					const updated = await voidMutation.mutateAsync({
						id: invoiceId,
						dto: { reason },
					});
					modals.closeAll();
					notifications.show({
						title: t('notifications.voided.title'),
						message: t('notifications.voided.message', {
							number: updated.invoiceNumber,
						}),
						color: 'orange',
					});
				} catch {
					notifications.show({
						title: t('notifications.voidFailed.title'),
						message: t('notifications.voidFailed.message'),
						color: 'red',
					});
				}
			},
		});
	}, [voidMutation, invoiceId, t]);

	const handleDownload = useCallback(async () => {
		setIsDownloading(true);
		try {
			await downloadMutation.mutateAsync(invoiceId);
		} catch (err) {
			const status = (err as Error & { status?: number }).status;
			if (status === 422) {
				notifications.show({
					title: t('notifications.downloadFailed.title'),
					message: t('notifications.downloadFailed.invalidTemplate'),
					color: 'red',
				});
			} else if (status === 404) {
				notifications.show({
					title: t('notifications.downloadFailed.title'),
					message: t('notifications.downloadFailed.noTemplate'),
					color: 'red',
				});
			} else {
				notifications.show({
					title: t('notifications.downloadFailed.title'),
					message: t('notifications.downloadFailed.generic'),
					color: 'red',
				});
			}
		} finally {
			setIsDownloading(false);
		}
	}, [downloadMutation, invoiceId, t]);

	if (isLoading) {
		return (
			<ContentContainer>
				<Center py='xl'>
					<Loader />
				</Center>
			</ContentContainer>
		);
	}

	if (isError || !invoice) {
		return (
			<ContentContainer>
				<Alert icon={<IconInfoCircle size={18} />} color='red'>
					{error instanceof Error ? error.message : t('detail.error.notFound')}
				</Alert>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer
			title={invoice.invoiceNumber}
			description={formatInvoicePeriod(invoice.periodStart, invoice.periodEnd)}
		>
			<div className={classes.root}>
				<SectionCard padding='lg'>
					<div className={classes.reviewHeader}>
						<Stack gap='xs'>
							<Group gap='xs'>
								<Button
									variant='subtle'
									leftSection={<IconArrowLeft size={16} />}
									onClick={() => void navigate('/billing/invoices')}
									size='sm'
								>
									{t('detail.actions.back')}
								</Button>
								<InvoiceStatusBadge status={invoice.status} />
							</Group>
							<Title order={2}>{invoice.invoiceNumber}</Title>
							<Group gap='xs'>
								<Badge variant='light'>
									{formatInvoicePeriod(invoice.periodStart, invoice.periodEnd)}
								</Badge>
								<Badge variant='light' color='gray'>
									{formatInvoiceDate(invoice.createdAt)}
								</Badge>
							</Group>
						</Stack>
						<Stack gap='xs' align='flex-end'>
							<Text size='xs' c='dimmed'>
								{t('detail.review.total')}
							</Text>
							<Text className={classes.headerTotal}>
								{getInvoiceTotalDisplay(invoice)}
							</Text>
							<Group gap='xs'>
								{invoice.status === 'DRAFT' && (
									<Button
										leftSection={<IconCheck size={16} />}
										color='green'
										size='sm'
										loading={issueMutation.isPending}
										onClick={handleIssue}
									>
										{t('detail.actions.issue')}
									</Button>
								)}
								<Button
									leftSection={<IconDownload size={16} />}
									variant={invoice.status === 'ISSUED' ? 'filled' : 'light'}
									size='sm'
									loading={isDownloading}
									onClick={() => void handleDownload()}
								>
									{t('detail.actions.download')}
								</Button>
								{invoice.status !== 'VOIDED' && (
									<Button
										leftSection={<IconBan size={16} />}
										color='red'
										variant='light'
										size='sm'
										loading={voidMutation.isPending}
										onClick={handleVoid}
									>
										{t('detail.actions.void')}
									</Button>
								)}
							</Group>
						</Stack>
					</div>
				</SectionCard>

				{(invoice.voidedAt || invoice.voidReason) && (
					<Alert
						icon={<IconBan size={18} />}
						color='red'
						title={t('detail.review.voidedTitle')}
					>
						<Stack gap='xs'>
							{invoice.voidedAt && (
								<Group justify='space-between'>
									<Text size='sm' c='dimmed'>
										{t('detail.review.voidedAt')}
									</Text>
									<Text size='sm'>
										{formatInvoiceDateTime(invoice.voidedAt)}
									</Text>
								</Group>
							)}
							{invoice.voidReason && (
								<Group justify='space-between' align='flex-start'>
									<Text size='sm' c='dimmed'>
										{t('detail.review.voidReason')}
									</Text>
									<Text size='sm' ta='right'>
										{invoice.voidReason}
									</Text>
								</Group>
							)}
						</Stack>
					</Alert>
				)}

				<div className={classes.reviewGrid}>
					<SectionCard title={t('detail.review.identity')} padding='sm'>
						<div className={classes.metaGrid}>
							<div className={classes.metaItem}>
								<Text size='xs' c='dimmed'>
									{t('detail.metadata.invoiceNumber')}
								</Text>
								<Text size='sm' fw={600}>
									{invoice.invoiceNumber}
								</Text>
							</div>
							<div className={classes.metaItem}>
								<Text size='xs' c='dimmed'>
									{t('detail.metadata.status')}
								</Text>
								<InvoiceStatusBadge status={invoice.status} />
							</div>
							<div className={classes.metaItem}>
								<Text size='xs' c='dimmed'>
									{t('detail.metadata.period')}
								</Text>
								<Text size='sm'>
									{formatInvoicePeriod(invoice.periodStart, invoice.periodEnd)}
								</Text>
							</div>
							<div className={classes.metaItem}>
								<Text size='xs' c='dimmed'>
									{t('detail.metadata.createdAt')}
								</Text>
								<Text size='sm'>{formatInvoiceDate(invoice.createdAt)}</Text>
							</div>
						</div>
					</SectionCard>

					<SectionCard title={t('detail.review.financials')} padding='sm'>
						<div className={classes.totalsGrid}>
							<Text size='sm'>{t('detail.review.subtotal')}</Text>
							<Text size='sm' ta='right'>
								{getInvoiceSubtotalDisplay(invoice)}
							</Text>
							<Text size='sm'>{t('detail.review.tax')}</Text>
							<Text size='sm' ta='right'>
								{getInvoiceTaxDisplay(invoice)}
							</Text>
							<Text size='sm'>{t('detail.review.hourlyRate')}</Text>
							<Text size='sm' ta='right'>
								{invoice.snapshot.invoice.hourlyRateFormatted}
							</Text>
							<Divider className={classes.divider} />
							<Text size='md' fw={750}>
								{t('detail.review.total')}
							</Text>
							<Text size='md' fw={750} ta='right'>
								{getInvoiceTotalDisplay(invoice)}
							</Text>
						</div>
					</SectionCard>
				</div>

				<InvoiceSnapshotCard snapshot={invoice.snapshot} />
			</div>
		</ContentContainer>
	);
};

export default InvoiceDetailPage;
