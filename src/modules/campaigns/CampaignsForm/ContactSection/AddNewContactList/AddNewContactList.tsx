import { Button, Group, Stack, Text, Skeleton, Box } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import styles from './AddNewContactList.module.css';
import { useCampaignSchedules } from '~/queries/schedulerQueries';
import { useUploadContactGroupFile } from '~/queries/contactGroupFilesQueries';
import type { ContactFileSummary } from '~/models/ContactFileSummary';
import ContactLimits from '../ContactLimits';

interface AddNewContactListProps {
	onClose: () => void;
	onRefresh: () => void;
	campaignId: string | number | undefined;
	objectiveId?: number;
}

export const AddNewContactList = ({
	onClose,
	onRefresh,
	campaignId,
	objectiveId,
}: AddNewContactListProps) => {
	const [summary, setSummary] = useState<ContactFileSummary | null>(null);
	// Mutation to upload contact list file to backend
	const uploadContactGroupFileMutation = useUploadContactGroupFile({});
	const { refetch: reloadCampaignSchedules } = useCampaignSchedules(campaignId);

	const uploadFile = async (file: File | null) => {
		if (!file) {
			notifications.show({
				title: 'No file selected',
				message: 'Please choose a CSV file to upload.',
				color: 'yellow',
			});
			return;
		}

		// Enforce CSV files as backend requires CSV
		const isCsv = file.name.toLowerCase().endsWith('.csv');
		if (!isCsv) {
			notifications.show({
				title: 'Invalid file type',
				message: 'Only CSV files (.csv) are supported for upload.',
				color: 'red',
			});
			return;
		}

		if (!campaignId) return;

		try {
			const summary = await uploadContactGroupFileMutation.mutateAsync({
				file,
				campaignId,
			});
			setSummary(summary);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: 'Failed to upload contact list file';

			notifications.show({
				title: 'Upload failed',
				message,
				color: 'red',
			});
		}
	};

	const handleFileUpload = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		await uploadFile(event.target.files?.[0] || null);
	};

	// Drag and drop handlers
	const [isDragging, setIsDragging] = useState(false);

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		await uploadFile(e.dataTransfer.files?.[0] || null);
	};

	return (
		<Box pos='relative'>
			{summary && (
				<ContactLimits
					onComplete={() => {
						setSummary(null);
						onClose();
						reloadCampaignSchedules();
						onRefresh();
					}}
					contactGroup={{}}
					fileSummary={summary}
					objectiveId={objectiveId}
					campaignId={campaignId}
				/>
			)}
			{!summary && (
				<Skeleton visible={uploadContactGroupFileMutation.isPending}>
					<Stack gap='md'>
						<Text size='sm' c='dimmed'>
							Upload a new contact list file for this campaign.
						</Text>

						<div
							className={`${styles.uploadArea} ${
								isDragging ? styles.dragActive : ''
							}`}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
						>
							<input
								type='file'
								id='contact-list-upload'
								accept='.csv'
								onChange={handleFileUpload}
								style={{ display: 'none' }}
							/>
							<label
								htmlFor='contact-list-upload'
								className={styles.uploadLabel}
							>
								<Stack align='center' gap='xs'>
									<IconUpload size={24} />
									<Text fw={500}>Upload Contact File</Text>
									<Text size='sm' c='dimmed'>
										Drag and drop your Excel or CSV file here
									</Text>
								</Stack>
							</label>
						</div>

						<Group justify='flex-end' mt='md'>
							<Button variant='default' onClick={onClose}>
								Cancel
							</Button>
						</Group>
					</Stack>
				</Skeleton>
			)}
		</Box>
	);
};

export default AddNewContactList;
