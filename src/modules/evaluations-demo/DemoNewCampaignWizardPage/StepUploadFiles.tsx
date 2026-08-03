import React, { useRef, useState } from 'react';
import {
	ActionIcon,
	Button,
	Group,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { IconArrowLeft, IconTrash, IconUpload } from '@tabler/icons-react';
import BaseTable from '~/components/BaseTable';
import type { BaseTableColumnDef } from '~/components/BaseTable';
import { wizardKitStyles } from '../components/DemoWizardKit';
import type {
	DemoWizardUploadedFile,
	DemoWizardCampaignDetails,
} from './types';
import styles from './DemoNewCampaignWizardPage.module.css';

const AGENT_POOL = ['Alex Brown', 'John Smith', 'Sarah Johnson', 'Mike Chen'];

// Generate formatted filename: C4087_20260715-093044_jmendez_8493305512.mp3
function generateFormattedFilename(
	agentName: string,
	campaignName: string,
	fileExtension: string
): string {
	// Campaign code: extract first letter of each word or use default
	const campaignCode =
		campaignName
			.split(/\s+/)
			.map((word) => word[0].toUpperCase())
			.join('') || 'CAMP';

	// Current timestamp: yyyyMMdd-HHmmss
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

	// Agent initials: first letter of first and last names
	const agentInitials = agentName
		.split(/\s+/)
		.map((part) => part[0].toLowerCase())
		.join('');

	// Agent ID/phone: random 10-digit number
	const agentId = String(Math.floor(Math.random() * 9000000000) + 1000000000);

	return `${campaignCode}_${timestamp}_${agentInitials}_${agentId}.${fileExtension}`;
}

function buildUploadedFile(
	file: File,
	index: number,
	campaignName: string
): DemoWizardUploadedFile {
	const format = (file.name.split('.').pop() ?? 'mp3').toUpperCase();
	const fileExtension = file.name.split('.').pop() ?? 'mp3';
	const agentName = AGENT_POOL[index % AGENT_POOL.length];
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
	};
}

interface StepUploadFilesProps {
	campaignDetails: DemoWizardCampaignDetails;
	files: DemoWizardUploadedFile[];
	onChange: (files: DemoWizardUploadedFile[]) => void;
	onBack: () => void;
	onNext?: () => void;
	onCreate?: () => void;
	onExit: () => void;
}

const StepUploadFiles: React.FC<StepUploadFilesProps> = ({
	campaignDetails,
	files,
	onChange,
	onBack,
	onNext,
	onCreate,
	onExit,
}) => {
	const [isDragOver, setIsDragOver] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const addFiles = (fileList: FileList | null) => {
		if (!fileList || fileList.length === 0) return;
		const newRows = Array.from(fileList).map((file, index) =>
			buildUploadedFile(file, files.length + index, campaignDetails.name)
		);
		onChange([...files, ...newRows]);
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
		onChange(files.filter((f) => f.id !== id));
	};

	const columns: BaseTableColumnDef<DemoWizardUploadedFile>[] = [
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
		<Stack gap='md'>
			<Group gap='sm' align='flex-start' wrap='nowrap'>
				<ActionIcon
					variant='subtle'
					color='green'
					mt={4}
					aria-label='Exit wizard'
					onClick={onExit}
				>
					<IconArrowLeft size={18} />
				</ActionIcon>
				<div>
					<Text fw={700} size='lg'>
						Upload Campaign Files
					</Text>
					<Text size='sm' c='dimmed'>
						Upload audio files to create your campaign (Optional — You can
						upload files later)
					</Text>
				</div>
			</Group>

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
								Support for MP3, WAV, and other audio formats. Upload up to 100+
								files at once.
							</Text>
							<Text size='xs' c='dimmed' fs='italic'>
								(Optional — You can create the campaign and upload files later)
							</Text>
						</Stack>
					</div>
					<TextInput
						mt='md'
						placeholder='Click to select audio files'
						readOnly
						onClick={handleDropzoneClick}
					/>
				</div>
			) : (
				<div className={wizardKitStyles.stepCard}>
					<Group justify='space-between' mb='md'>
						<div>
							<Text fw={700}>Uploaded Files</Text>
							<Text size='sm' c='dimmed'>
								{files.length} files ready
							</Text>
						</div>
						<Button variant='light' color='green' onClick={handleDropzoneClick}>
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

			<Group justify='flex-end' className={styles.footerRow}>
				<Button variant='default' onClick={onBack}>
					Back
				</Button>
				{files.length === 0 ? (
					<Button variant='light' color='green' onClick={onCreate || onNext}>
						Skip and Create Campaign
					</Button>
				) : (
					<>
						<Button variant='light' color='green' onClick={onCreate || onNext}>
							Upload Later
						</Button>
						<Button color='green' onClick={onCreate || onNext}>
							Create Campaign
						</Button>
					</>
				)}
			</Group>
		</Stack>
	);
};

export default StepUploadFiles;
