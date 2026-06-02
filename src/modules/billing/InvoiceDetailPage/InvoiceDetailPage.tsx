import { useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
	Alert,
	Button,
	Center,
	Group,
	Loader,
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
	useDownloadDocx,
} from '~/queries/invoiceQueries';
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
	const downloadMutation = useDownloadDocx();
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
						title: 'Error',
						message: 'Failed to issue invoice.',
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
						title: 'Error',
						message: 'Reason is required.',
						color: 'red',
					});
					return;
				}
				try {
					const updated = await voidMutation.mutateAsync({
						id: invoiceId,
						dto: { reason },
					});
					notifications.show({
						title: t('notifications.voided.title'),
						message: t('notifications.voided.message', {
							number: updated.invoiceNumber,
						}),
						color: 'orange',
					});
				} catch {
					notifications.show({
						title: 'Error',
						message: 'Failed to void invoice.',
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
					title: 'Error',
					message: t('notifications.downloadFailed.invalidTemplate'),
					color: 'red',
				});
			} else if (status === 404) {
				notifications.show({
					title: 'Error',
					message: t('notifications.downloadFailed.noTemplate'),
					color: 'red',
				});
			} else {
				notifications.show({
					title: 'Error',
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
					{error instanceof Error ? error.message : 'Invoice not found.'}
				</Alert>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer>
			<div className={classes.root}>
				<SectionCard>
					<div className={classes.header}>
						<Group gap='sm'>
							<Button
								variant='subtle'
								leftSection={<IconArrowLeft size={16} />}
								onClick={() => void navigate('/billing/invoices')}
								size='sm'
							>
								{t('detail.actions.back')}
							</Button>
							<Title order={4}>{invoice.invoiceNumber}</Title>
							<InvoiceStatusBadge status={invoice.status} />
						</Group>
						<Group gap='xs'>
							{invoice.status === 'DRAFT' && (
								<Button
									leftSection={<IconCheck size={16} />}
									color='green'
									variant='light'
									size='sm'
									loading={issueMutation.isPending}
									onClick={handleIssue}
								>
									{t('detail.actions.issue')}
								</Button>
							)}
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
							<Button
								leftSection={<IconDownload size={16} />}
								variant='light'
								size='sm'
								loading={isDownloading}
								onClick={() => void handleDownload()}
							>
								{t('detail.actions.download')}
							</Button>
						</Group>
					</div>
				</SectionCard>

				<SectionCard padding='sm'>
					<div className={classes.metaGrid}>
						<div className={classes.metaItem}>
							<Text size='xs' c='dimmed'>
								{t('detail.metadata.period')}
							</Text>
							<Text size='sm'>
								{invoice.periodStart} – {invoice.periodEnd}
							</Text>
						</div>
						<div className={classes.metaItem}>
							<Text size='xs' c='dimmed'>
								{t('detail.metadata.currency')}
							</Text>
							<Text size='sm'>{invoice.currency}</Text>
						</div>
						<div className={classes.metaItem}>
							<Text size='xs' c='dimmed'>
								{t('detail.metadata.createdAt')}
							</Text>
							<Text size='sm'>
								{new Date(invoice.createdAt).toLocaleDateString()}
							</Text>
						</div>
					</div>
				</SectionCard>

				<InvoiceSnapshotCard snapshot={invoice.snapshot} />
			</div>
		</ContentContainer>
	);
};

export default InvoiceDetailPage;
