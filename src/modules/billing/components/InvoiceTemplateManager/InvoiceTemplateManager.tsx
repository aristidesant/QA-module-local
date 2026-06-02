import { useRef, useState } from 'react';
import {
	Alert,
	Badge,
	Button,
	Center,
	Collapse,
	Group,
	Select,
	Stack,
	Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
	IconChevronDown,
	IconChevronRight,
	IconInfoCircle,
	IconUpload,
	IconTrash,
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

const InvoiceTemplateManager: React.FC = () => {
	const { t } = useTranslation('billing');
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isExpanded, setIsExpanded] = useState(false);
	const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

	const { data: clients = [] } = useGetAllClients();
	const { data: selectedClient } = useGetClient(selectedClientId ?? 0);
	const { data: clientFiles = [] } = useGetClientFiles(
		selectedClientId ?? undefined
	);
	const { data: fileTypes = [] } = useGetFileTypes();
	const uploadMutation = useUploadFile();
	const updateMutation = useUpdateClient();

	const templateTypeId = fileTypes.find(
		(ft) => ft.code === 'billing-template'
	)?.id;

	const currentTemplateFileId = selectedClient?.invoiceTemplateFileId ?? null;
	const currentTemplateFile = currentTemplateFileId
		? (clientFiles.find((f) => f.id === currentTemplateFileId) ?? null)
		: null;

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

		if (!file.name.toLowerCase().endsWith('.docx')) {
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

	const isUploading = uploadMutation.isPending || updateMutation.isPending;

	return (
		<SectionCard
			title={
				<Group
					gap='xs'
					onClick={() => setIsExpanded(!isExpanded)}
					className={classes.clickableTitle}
				>
					{isExpanded ? (
						<IconChevronDown size={16} />
					) : (
						<IconChevronRight size={16} />
					)}
					<Text>{t('templates.card.title')}</Text>
					{configuredCount > 0 && (
						<Badge size='sm' variant='light' color='green'>
							{t('templates.count', { count: configuredCount })}
						</Badge>
					)}
				</Group>
			}
			description={t('templates.card.description')}
		>
			<Collapse expanded={isExpanded}>
				<Stack gap='sm'>
					<Select
						label={t('templates.issuerClient.label')}
						placeholder={t('templates.issuerClient.placeholder')}
						data={clientOptions}
						value={selectedClientId != null ? String(selectedClientId) : null}
						onChange={(v) => setSelectedClientId(v ? Number(v) : null)}
						clearable
						searchable
						size='sm'
					/>

					{selectedClientId && (
						<>
							<Group gap='xs'>
								<Text size='sm' fw={500}>
									{t('templates.currentTemplate')}:
								</Text>
								{currentTemplateFile ? (
									<Group gap={4}>
										<Text size='sm'>{currentTemplateFile.name}</Text>
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

							<Alert
								icon={<IconInfoCircle size={16} />}
								color='blue'
								variant='light'
								p='xs'
							>
								<Text size='xs'>{t('templates.info')}</Text>
							</Alert>

							<Group gap='xs'>
								<Button
									size='sm'
									variant='light'
									leftSection={<IconUpload size={16} />}
									loading={isUploading}
									disabled={!selectedClientId}
									onClick={() => fileInputRef.current?.click()}
								>
									{isUploading
										? t('templates.actions.uploading')
										: t('templates.actions.upload')}
								</Button>

								{currentTemplateFile && (
									<Button
										size='sm'
										variant='outline'
										color='red'
										leftSection={<IconTrash size={16} />}
										loading={isUploading}
										onClick={handleRemove}
									>
										{t('templates.actions.remove')}
									</Button>
								)}
							</Group>

							<input
								ref={fileInputRef}
								type='file'
								accept='.docx'
								className={classes.hiddenInput}
								onChange={handleFileSelected}
							/>
						</>
					)}

					{!selectedClientId && (
						<Center>
							<Text size='sm' c='dimmed'>
								{t('templates.issuerClient.placeholder')}
							</Text>
						</Center>
					)}
				</Stack>
			</Collapse>
		</SectionCard>
	);
};

export default InvoiceTemplateManager;
