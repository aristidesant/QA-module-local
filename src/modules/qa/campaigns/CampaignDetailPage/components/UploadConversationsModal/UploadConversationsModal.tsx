import React, { useRef, useState } from 'react';
import { ActionIcon, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import BaseTable from '~/components/BaseTable';
import type { BaseTableColumnDef } from '~/components/BaseTable';
import { wizardKitStyles } from '~/modules/evaluations-demo/components/DemoWizardKit';
import styles from '../../CampaignDetailPage.module.css';

const AGENT_POOL = ['Alex Brown', 'John Smith', 'Sarah Johnson', 'Mike Chen'];

interface UploadedFile {
	id: string;
	fileName: string;
	durationSeconds: number;
	format: string;
	agentName: string;
	campaignFileId: string;
	file: File;
}

interface UploadConversationsModalProps {
	opened: boolean;
	onClose: () => void;
	onUpload: (files: File[]) => Promise<void>;
	uploading: boolean;
	campaignName?: string;
}

function generateFormattedFilename(
	agentName: string,
	campaignName: string,
	fileExtension: string
): string {
	const campaignCode =
		campaignName
			.split(/\s+/)
			.map((word) => word[0].toUpperCase())
			.join('') || 'CAMP';

	const now = new Date();
	const timestamp =
		[
			now.getFullYear(),
			String(now.getMonth() + 1).padStart(2, '0'),
			String(now.getDate()).padStart(2, '0'),
		].join('') +
		'-' +
		[
			String(now.getHours()).padStart(2, '0'),
			String(now.getMinutes()).padStart(2, '0'),
			String(now.getSeconds()).padStart(2, '0'),
		].join('');

	const agentInitials = agentName
		.split(/\s+/)
		.map((part) => part[0].toLowerCase())
		.join('');

	const agentId = String(Math.floor(Math.random() * 9000000000) + 1000000000);

	return `${campaignCode}_${timestamp}_${agentInitials}_${agentId}.${fileExtension}`;
}

const UploadConversationsModal: React.FC<UploadConversationsModalProps> = ({
	opened,
	onClose,
	onUpload,
	uploading,
	campaignName = 'Campaign',
}) => {
	const [isDragOver, setIsDragOver] = useState(false);
	const [files, setFiles] = useState<UploadedFile[]>([]);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const addFiles = (fileList: FileList | null) => {
		if (!fileList || fileList.length === 0) return;

		const newFiles = Array.from(fileList)
			.filter(
				(file) =>
					file.type.startsWith('audio/') ||
					file.name.toLowerCase().endsWith('.mp3')
			)
			.map((file, index) => {
				const format = (file.name.split('.').pop() ?? 'mp3').toUpperCase();
				const fileExtension = file.name.split('.').pop() ?? 'mp3';
				const agentName =
					AGENT_POOL[(files.length + index) % AGENT_POOL.length];
				const formattedFileName = generateFormattedFilename(
					agentName,
					campaignName,
					fileExtension
				);

				return {
					id: `${file.name}-${Date.now()}-${index}`,
					fileName: formattedFileName,
					durationSeconds: 60 + Math.floor(Math.random() * 400),
					format,
					agentName,
					campaignFileId: `CAMP-${Date.now()}-${index}`,
					file,
				};
			});

		setFiles([...files, ...newFiles]);
	};

	const handleDropzoneClick = () => fileInputRef.current?.click();

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = () => setIsDragOver(false);

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
		addFiles(e.dataTransfer.files);
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		addFiles(e.target.files);
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	const removeFile = (id: string) => {
		setFiles(files.filter((f) => f.id !== id));
	};

	const handleUpload = async () => {
		const filesToUpload = files.map((f) => f.file);
		if (filesToUpload.length === 0) return;

		try {
			await onUpload(filesToUpload);
			setFiles([]);
			onClose();
		} catch (error) {
			// Error handling is done by parent
		}
	};

	const columns: BaseTableColumnDef<UploadedFile>[] = [
		{
			accessorKey: 'fileName',
			header: 'Filename',
			cell: ({ row }) => (
				<Text size='sm' fw={600}>
					{row.original.fileName}
				</Text>
			),
		},
		{
			accessorKey: 'durationSeconds',
			header: 'Duration',
			cell: ({ row }) => (
				<Text size='sm' c='dimmed'>
					{row.original.durationSeconds}s
				</Text>
			),
			size: 100,
		},
		{
			accessorKey: 'format',
			header: 'Format',
			cell: ({ row }) => (
				<Text size='xs' c='dimmed' tt='uppercase'>
					{row.original.format}
				</Text>
			),
			size: 100,
		},
		{
			accessorKey: 'agentName',
			header: 'Agent',
			cell: ({ row }) => <Text size='sm'>{row.original.agentName}</Text>,
		},
		{
			accessorKey: 'campaignFileId',
			header: 'Campaign ID',
			cell: ({ row }) => (
				<Text size='xs' c='dimmed'>
					{row.original.campaignFileId}
				</Text>
			),
		},
		{
			id: 'actions',
			header: 'Actions',
			cell: ({ row }) => (
				<ActionIcon
					variant='subtle'
					color='red'
					size='sm'
					aria-label='Remove file'
					onClick={() => removeFile(row.original.id)}
				>
					<IconTrash size={16} />
				</ActionIcon>
			),
			size: 80,
		},
	];

	const dropzoneClass = [
		styles.dropzone,
		isDragOver ? styles.dropzoneDragOver : '',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title='Upload Conversations'
			size='90%'
			// inline-style-allow: responsive modal width constraint
			style={{ maxWidth: '1200px' }}
		>
			<Stack gap='md'>
				<input
					ref={fileInputRef}
					type='file'
					accept='audio/*'
					multiple
					className={styles.hiddenInput}
					onChange={handleFileInputChange}
				/>

				{files.length === 0 ? (
					<div className={wizardKitStyles.stepCard}>
						<div
							className={dropzoneClass}
							onClick={handleDropzoneClick}
							onDragOver={handleDragOver}
							onDragEnter={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
							role='button'
							tabIndex={0}
							onKeyDown={(e) => e.key === 'Enter' && handleDropzoneClick()}
						>
							<Stack align='center' gap={4}>
								<IconUpload
									size={32}
									stroke={1.5}
									color='var(--mantine-color-green-6)'
								/>
								<Text fw={600}>Drag files here or click to upload</Text>
								<Text size='sm' c='dimmed'>
									Support for MP3, WAV, and other audio formats. Upload up to
									100+ files at once.
								</Text>
							</Stack>
						</div>
					</div>
				) : (
					<div className={wizardKitStyles.stepCard}>
						<Group justify='space-between' mb='md'>
							<div>
								<Text fw={700}>Files to Upload</Text>
								<Text size='sm' c='dimmed'>
									{files.length} files ready
								</Text>
							</div>
							<Button
								variant='light'
								color='green'
								onClick={handleDropzoneClick}
							>
								Add More Files
							</Button>
						</Group>
						<BaseTable
							data={files}
							columns={columns}
							getRowId={(f) => f.id}
							density='compact'
							filterMode='client'
						/>
					</div>
				)}

				<Group justify='flex-end'>
					<Button variant='default' onClick={onClose} disabled={uploading}>
						Cancel
					</Button>
					<Button
						color='green'
						onClick={handleUpload}
						disabled={files.length === 0}
						loading={uploading}
					>
						Upload {files.length > 0 && `(${files.length})`}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};

export default UploadConversationsModal;
