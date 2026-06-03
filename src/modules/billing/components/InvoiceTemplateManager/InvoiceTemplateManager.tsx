import { useRef, useState } from 'react';
import {
	Badge,
	Button,
	Center,
	Collapse,
	Group,
	Select,
	Skeleton,
	Stack,
	Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
	IconChevronDown,
	IconDownload,
	IconFileDescription,
	IconUpload,
	IconTrash,
	IconVariable,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '~/utils/httpClient';
import classes from './InvoiceTemplateManager.module.css';
import {
	useGetAllClients,
	useGetClient,
	useUpdateClient,
} from '~/queries/clientQueries';
import {
	useGetClientFiles,
	useGetFileTypes,
	useUploadFile,
} from '~/queries/fileQueries';
import { useDownloadInvoiceTemplate } from '~/queries/invoiceQueries';
import PlaceholderGuideModal from '~/modules/billing/components/PlaceholderGuideModal';

const InvoiceTemplateManager: React.FC = () => {
	const { t } = useTranslation('billing');
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isExpanded, setIsExpanded] = useState(false);
	const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
	const [guideModalOpened, { open: openGuideModal, close: closeGuideModal }] =
		useDisclosure(false);

	const { data: clients = [], isLoading: isClientsLoading } =
		useGetAllClients();
	const { data: selectedClient, isLoading: isSelectedClientLoading } =
		useGetClient(selectedClientId ?? 0, isExpanded);
	const { data: clientFiles = [], isLoading: isClientFilesLoading } =
		useGetClientFiles(selectedClientId ?? undefined, isExpanded);
	const { data: fileTypes = [], isLoading: isFileTypesLoading } =
		useGetFileTypes(isExpanded);
	const uploadMutation = useUploadFile();
	const updateMutation = useUpdateClient();
	const downloadTemplateMutation = useDownloadInvoiceTemplate();

	const templateTypeId = fileTypes.find(
		(ft) => ft.code === 'billing-template'
	)?.id;

	const currentTemplateFileId = selectedClient?.invoiceTemplateFileId ?? null;
	const currentTemplateFile = currentTemplateFileId
		? (clientFiles.find((f) => f.id === currentTemplateFileId) ?? null)
		: null;
	const isTemplateDataLoading =
		isExpanded &&
		selectedClientId != null &&
		(isSelectedClientLoading || isClientFilesLoading || isFileTypesLoading);

	const configuredCount = clients.filter(
		(c) => c.invoiceTemplateFileId != null
	).length;

	const clientOptions = clients.map((c) => ({
		value: String(c.id),
		label: c.name,
	}));

	const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file || !selectedClientId) return;
		if (!templateTypeId) {
			notifications.show({
				title: t('templates.notifications.uploadError'),
				message: '',
				color: 'red',
			});
			return;
		}

		const ext = file.name.toLowerCase().split('.').pop();
		if (ext !== 'xlsx') {
			notifications.show({
				title: t('templates.notifications.uploadError'),
				message: '',
				color: 'red',
			});
			return;
		}

		try {
			const uploadedFile = await uploadMutation.mutateAsync({
				file,
				typeId: templateTypeId,
				description: `Invoice template for ${selectedClient?.name ?? 'client'}`,
			});

			await updateMutation.mutateAsync({
				id: selectedClientId,
				data: { invoiceTemplateFileId: uploadedFile.id },
			});

			queryClient.invalidateQueries({ queryKey: ['files', selectedClientId] });
			queryClient.invalidateQueries({ queryKey: ['client', selectedClientId] });

			notifications.show({
				title: t('templates.notifications.uploaded'),
				message: '',
				color: 'green',
			});
		} catch (error) {
			notifications.show({
				title: t('templates.notifications.uploadError'),
				message: getErrorMessage(error),
				color: 'red',
			});
		}

		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleRemove = async () => {
		if (!selectedClientId) return;

		try {
			await updateMutation.mutateAsync({
				id: selectedClientId,
				data: { invoiceTemplateFileId: null },
			});

			queryClient.invalidateQueries({ queryKey: ['files', selectedClientId] });
			queryClient.invalidateQueries({ queryKey: ['client', selectedClientId] });

			notifications.show({
				title: t('templates.notifications.removed'),
				message: '',
				color: 'orange',
			});
		} catch (error) {
			notifications.show({
				title: t('templates.notifications.assignError'),
				message: getErrorMessage(error),
				color: 'red',
			});
		}
	};

	const handleDownloadTemplate = async () => {
		if (!selectedClientId) return;
		try {
			await downloadTemplateMutation.mutateAsync(selectedClientId);
		} catch (error) {
			notifications.show({
				title: t('templates.notifications.downloadError'),
				message: getErrorMessage(error),
				color: 'red',
			});
		}
	};

	const isUploading = uploadMutation.isPending || updateMutation.isPending;

	return (
		<>
			<div
				role='button'
				tabIndex={0}
				aria-label={t('templates.toolbarTitle')}
				aria-expanded={isExpanded}
				aria-controls='invoice-template-settings'
				onClick={() => setIsExpanded(!isExpanded)}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						setIsExpanded(!isExpanded);
					}
				}}
				className={`${classes.toolbarRow} ${isExpanded ? classes.toolbarRowExpanded : ''}`}
			>
				<div className={classes.toolbarLabel}>
					<IconFileDescription size={14} stroke={1.5} />
					<Text span size='sm' fw={500}>
						{t('templates.toolbarTitle')}
					</Text>
					{configuredCount > 0 && (
						<Badge size='sm' variant='light' color='green'>
							{t('templates.count', { count: configuredCount })}
						</Badge>
					)}
				</div>
				<IconChevronDown
					size={14}
					stroke={1.5}
					className={`${classes.chevronIcon} ${isExpanded ? classes.chevronIconExpanded : ''}`}
				/>
			</div>

			<Collapse expanded={isExpanded} id='invoice-template-settings'>
				<div className={classes.expandedPanel}>
					<Stack gap='sm'>
						{isClientsLoading && clients.length === 0 ? (
							<Stack gap={6}>
								<Skeleton height={12} width='34%' radius='xl' />
								<Skeleton height={36} radius='sm' />
							</Stack>
						) : (
							<>
								<Button
									size='xs'
									variant='subtle'
									leftSection={<IconVariable size={14} />}
									onClick={openGuideModal}
								>
									{t('templates.variablesGuide.action')}
								</Button>
								<Select
									label={t('templates.issuerClient.label')}
									placeholder={t('templates.issuerClient.placeholder')}
									data={clientOptions}
									value={
										selectedClientId != null ? String(selectedClientId) : null
									}
									onChange={(v) => setSelectedClientId(v ? Number(v) : null)}
									clearable
									searchable
									size='xs'
								/>
							</>
						)}

						{selectedClientId && (
							<>
								<Group gap='xs'>
									<Text size='xs' fw={500}>
										{t('templates.currentTemplate')}:
									</Text>
									{isTemplateDataLoading ? (
										<Skeleton height={18} width='42%' radius='xl' />
									) : currentTemplateFile ? (
										<Group gap={4}>
											<Text size='xs'>{currentTemplateFile.name}</Text>
											<Badge size='sm' color='green' variant='light'>
												{t('templates.status.configured')}
											</Badge>
										</Group>
									) : (
										<Badge size='sm' color='gray' variant='light'>
											{t('templates.status.none')}
										</Badge>
									)}
								</Group>

								{isTemplateDataLoading ? (
									<Stack gap='xs'>
										<Skeleton height={48} radius='md' />
										<Group gap='xs'>
											<Skeleton height={30} width={120} radius='sm' />
											<Skeleton height={30} width={106} radius='sm' />
										</Group>
									</Stack>
								) : (
									<>
										<Text size='xs' c='dimmed'>
											{t('templates.info')}
										</Text>

										<Group gap='xs'>
											<Button
												size='xs'
												variant='light'
												leftSection={<IconUpload size={14} />}
												loading={isUploading}
												disabled={!selectedClientId || !templateTypeId}
												onClick={() => fileInputRef.current?.click()}
											>
												{isUploading
													? t('templates.actions.uploading')
													: t('templates.actions.upload')}
											</Button>

											{currentTemplateFile && (
												<>
													<Button
														size='xs'
														variant='light'
														leftSection={<IconDownload size={14} />}
														loading={downloadTemplateMutation.isPending}
														onClick={handleDownloadTemplate}
													>
														{t('templates.actions.download')}
													</Button>
													<Button
														size='xs'
														variant='outline'
														color='red'
														leftSection={<IconTrash size={14} />}
														loading={isUploading}
														onClick={handleRemove}
													>
														{t('templates.actions.remove')}
													</Button>
												</>
											)}
										</Group>

										<input
											ref={fileInputRef}
											type='file'
											accept='.xlsx'
											className={classes.hiddenInput}
											onChange={handleFileSelected}
										/>
									</>
								)}
							</>
						)}

						{!selectedClientId && (
							<Center py='xs'>
								<Text size='xs' c='dimmed'>
									{t('templates.issuerClient.placeholder')}
								</Text>
							</Center>
						)}
					</Stack>
				</div>
			</Collapse>
			<PlaceholderGuideModal
				opened={guideModalOpened}
				onClose={closeGuideModal}
			/>
		</>
	);
};

export default InvoiceTemplateManager;
