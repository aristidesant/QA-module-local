import { useState } from 'react';
import { Alert, Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconUpload } from '@tabler/icons-react';
import styles from './AppendContactsModal.module.css';
import { getErrorMessage } from '~/utils/httpClient';

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
	const { t } = useTranslation('campaigns');
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
			setErrorMessage(getErrorMessage(err));
		}
	};

	const handleAppend = async () => {
		if (!uploadedFileId) return;
		setErrorMessage(null);
		try {
			await onAppend(uploadedFileId);
			onClose();
		} catch (err) {
			setErrorMessage(getErrorMessage(err));
		}
	};

	return (
		<Modal
			opened
			onClose={onClose}
			title={t('contactListPage.contactsTable.appendModal.title')}
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
						<Text fw={500}>
							{file
								? t('contactListPage.contactsTable.appendModal.changeFile')
								: t('contactListPage.contactsTable.appendModal.selectFile')}
						</Text>
						<Text size='xs' c='dimmed'>
							{t('contactListPage.contactsTable.appendModal.dragAndDrop')}
						</Text>
						{file && !uploadedFileId && (
							<Text size='xs' c='blue'>
								{t('contactListPage.contactsTable.appendModal.selected', {
									name: file.name,
								})}
							</Text>
						)}
						{uploadedFileId && (
							<Text size='xs' c='green'>
								{t('contactListPage.contactsTable.appendModal.fileSaved', {
									id: uploadedFileId,
								})}
							</Text>
						)}
					</label>
				</div>
				{uploadedFileId && (
					<Alert
						color='green'
						variant='light'
						title={t('contactListPage.contactsTable.appendModal.step2Title')}
					>
						{t('contactListPage.contactsTable.appendModal.step2Message')}
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
						{t('common:actions.cancel')}
					</Button>
					{!uploadedFileId ? (
						<Button
							variant='filled'
							onClick={handleUpload}
							loading={isUploading}
							disabled={!file || isUploading}
						>
							{t('contactListPage.contactsTable.appendModal.saveFile')}
						</Button>
					) : (
						<Button
							variant='filled'
							color='blue'
							onClick={handleAppend}
							loading={isAppending}
							disabled={isAppending}
						>
							{t('contactListPage.contactsTable.appendModal.appendToList')}
						</Button>
					)}
				</Group>
			</Stack>
		</Modal>
	);
};

export default AppendContactsModal;
