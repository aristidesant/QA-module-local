import { useState } from 'react';
import { Alert, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import styles from './AppendContactsModal.module.css';

interface AppendContactsModalProps {
	onClose: () => void;
	onUpload: (file: File) => Promise<{ contactGroupFileId: number }>;
	onAppend: (contactGroupFileId: number) => Promise<void>;
	isUploading: boolean;
	isAppending: boolean;
}

const AppendContactsModal = ({
	onClose,
	onUpload,
	onAppend,
	isUploading,
	isAppending,
}: AppendContactsModalProps) => {
	const [file, setFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [uploadedFileId, setUploadedFileId] = useState<number | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFile(e.target.files?.[0] || null);
		setUploadedFileId(null);
		setErrorMessage(null);
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		setFile(e.dataTransfer.files?.[0] || null);
		setUploadedFileId(null);
		setErrorMessage(null);
	};

	const handleUpload = async () => {
		if (!file) return;
		setErrorMessage(null);
		try {
			const result = await onUpload(file);
			setUploadedFileId(result.contactGroupFileId);
		} catch (err) {
			setErrorMessage(
				err instanceof Error ? err.message : 'Failed to upload file.'
			);
		}
	};

	const handleAppend = async () => {
		if (!uploadedFileId) return;
		setErrorMessage(null);
		try {
			await onAppend(uploadedFileId);
			onClose();
		} catch (err) {
			setErrorMessage(
				err instanceof Error ? err.message : 'Failed to append contacts.'
			);
		}
	};

	return (
		<Modal
			opened
			onClose={onClose}
			title='Append Contacts via CSV'
			size='md'
			centered
		>
			<Stack className={styles.modalContainer} gap='md'>
				<div
					className={`${styles.uploadArea} ${isDragging ? styles.dragActive : ''}`}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
				>
					<input
						type='file'
						id='append-contact-file'
						accept='.csv'
						style={{ display: 'none' }}
						onChange={handleFileChange}
					/>
					<label htmlFor='append-contact-file' className={styles.uploadLabel}>
						<IconUpload size={28} />
						<Text fw={500}>{file ? 'Change CSV File' : 'Select CSV File'}</Text>
						<Text size='xs' c='dimmed'>
							Drag & drop or click to browse
						</Text>
						{file && !uploadedFileId && (
							<Text size='xs' c='blue'>
								Selected: {file.name}
							</Text>
						)}
						{uploadedFileId && (
							<Text size='xs' c='green'>
								File saved. ID: {uploadedFileId}
							</Text>
						)}
					</label>
				</div>
				{uploadedFileId && (
					<Alert color='green' variant='light' title='Step 2: Append to list'>
						Click "Append to List" to add these contacts to the current list.
					</Alert>
				)}
				{errorMessage && (
					<Text size='xs' c='red'>
						{errorMessage}
					</Text>
				)}
				<Group justify='flex-end' mt='sm'>
					<Button
						variant='default'
						onClick={onClose}
						disabled={isUploading || isAppending}
					>
						Cancel
					</Button>
					{!uploadedFileId ? (
						<Button
							variant='filled'
							onClick={handleUpload}
							loading={isUploading}
							disabled={!file || isUploading}
						>
							Save File
						</Button>
					) : (
						<Button
							variant='filled'
							color='blue'
							onClick={handleAppend}
							loading={isAppending}
							disabled={isAppending}
						>
							Append to List
						</Button>
					)}
				</Group>
			</Stack>
		</Modal>
	);
};

export default AppendContactsModal;
