import { useRef, useState } from 'react';
import {
	Badge,
	Button,
	Collapse,
	Divider,
	Group,
	Select,
	Skeleton,
	SimpleGrid,
	Stack,
	Text,
	UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
	IconChevronDown,
	IconDownload,
	IconFileDescription,
	IconTrash,
	IconUpload,
	IconVariable,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '~/utils/httpClient';
import SectionCard from '~/components/SectionCard';
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
			<SectionCard
				title={
					<UnstyledButton
						aria-label={t('templates.toolbarTitle')}
						aria-expanded={isExpanded}
						aria-controls='invoice-template-settings'
						onClick={() => setIsExpanded(!isExpanded)}
						className={classes.headerToggle}
					>
						<Group gap='xs' wrap='nowrap'>
							<IconFileDescription size={16} stroke={1.5} />
							<Text span size='sm' fw={600}>
								{t('templates.toolbarTitle')}
							</Text>
							{configuredCount > 0 && (
								<Badge size='sm' variant='light' color='green'>
									{t('templates.count', { count: configuredCount })}
								</Badge>
							)}
						</Group>
						<IconChevronDown
							size={16}
							stroke={1.5}
							className={`${classes.chevronIcon} ${isExpanded ? classes.chevronIconExpanded : ''}`}
						/>
					</UnstyledButton>
				}
				description={isExpanded ? t('templates.card.description') : undefined}
				padding='sm'
				contentSpacing='sm'
				className={`${classes.templateSectionCard} ${!isExpanded ? classes.templateSectionCardCollapsed : ''}`}
				headerActions={
					isExpanded ? (
						<Button
							size='xs'
							variant='subtle'
							leftSection={<IconVariable size={14} />}
							onClick={openGuideModal}
						>
							{t('templates.variablesGuide.action')}
						</Button>
					) : null
				}
			>
				<Collapse expanded={isExpanded} id='invoice-template-settings'>
					<Stack gap='sm'>
						{isClientsLoading && clients.length === 0 ? (
							<Stack gap={4}>
								<Skeleton height={12} width='34%' radius='xl' />
								<Skeleton height={36} radius='sm' />
								<Skeleton height={10} width='52%' radius='xl' />
							</Stack>
						) : (
							<SimpleGrid
								cols={{ base: 1, sm: 2 }}
								spacing='md'
								verticalSpacing='md'
							>
								<Stack gap='xs' className={classes.fieldColumn}>
									<Text size='xs' fw={600} className={classes.sectionLabel}>
										{t('templates.issuerClient.label')}
									</Text>
									<Select
										placeholder={t('templates.issuerClient.placeholder')}
										data={clientOptions}
										value={
											selectedClientId != null ? String(selectedClientId) : null
										}
										onChange={(v) => setSelectedClientId(v ? Number(v) : null)}
										clearable
										searchable
										size='sm'
									/>
									<Text size='xs' c='dimmed' className={classes.helperText}>
										{t('templates.issuerClient.helper')}
									</Text>
								</Stack>

								<Stack gap='xs' className={classes.fieldColumn}>
									<Group justify='space-between' align='center' gap='xs'>
										<Text size='xs' fw={600} className={classes.sectionLabel}>
											{t('templates.currentTemplate')}
										</Text>
										{selectedClientId != null && (
											<Badge size='sm' variant='light' color='gray'>
												{currentTemplateFile
													? t('templates.status.configured')
													: t('templates.status.none')}
											</Badge>
										)}
									</Group>

									{isTemplateDataLoading ? (
										<Stack gap='xs'>
											<Skeleton height={18} width='58%' radius='xl' />
											<Skeleton height={54} radius='md' />
											<Group gap='xs'>
												<Skeleton height={30} width={120} radius='sm' />
												<Skeleton height={30} width={106} radius='sm' />
											</Group>
										</Stack>
									) : currentTemplateFile ? (
										<div className={classes.templateCard}>
											<div className={classes.templateMeta}>
												<div className={classes.templateMetaText}>
													<Text
														size='sm'
														fw={500}
														className={classes.templateName}
													>
														{currentTemplateFile.name}
													</Text>
												</div>
												<Badge size='sm' color='green' variant='light'>
													{t('templates.status.configured')}
												</Badge>
											</div>

											<Group gap='xs' className={classes.actionsRow}>
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
											</Group>
										</div>
									) : selectedClientId ? (
										<div className={classes.emptyState}>
											<Text size='sm' fw={500}>
												{t('templates.status.none')}
											</Text>
											<Text size='xs' c='dimmed' className={classes.helperText}>
												{t('templates.issuerClient.helper')}
											</Text>
										</div>
									) : (
										<div className={classes.emptyState}>
											<Text size='sm' fw={500}>
												{t('templates.issuerClient.label')}
											</Text>
											<Text size='xs' c='dimmed' className={classes.helperText}>
												{t('templates.issuerClient.helper')}
											</Text>
										</div>
									)}
								</Stack>
							</SimpleGrid>
						)}

						{selectedClientId && (
							<>
								<Divider my={0} />
								<Text size='xs' c='dimmed'>
									{t('templates.info')}
								</Text>
							</>
						)}

						<input
							ref={fileInputRef}
							type='file'
							accept='.xlsx'
							className={classes.hiddenInput}
							onChange={handleFileSelected}
						/>
					</Stack>
				</Collapse>
			</SectionCard>
			<PlaceholderGuideModal
				opened={guideModalOpened}
				onClose={closeGuideModal}
			/>
		</>
	);
};

export default InvoiceTemplateManager;
