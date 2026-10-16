import {
	Badge,
	Button,
	Group,
	Loader,
	Modal,
	Stack,
	Tabs,
	Text,
} from '@mantine/core';
import { IconCheck, IconCloudUpload } from '@tabler/icons-react';
import {
	useMemo,
	useRef,
	useState,
	type DragEvent,
	type KeyboardEvent,
} from 'react';
import { useTranslation } from 'react-i18next';

import { notifySuccess, notifyWarning } from '~/modules/qa/utils/notifications';
import { useCampaignsStore } from '~/stores/qa/campaignsStore';
import {
	RECORDINGS_ACCEPT,
	RECORDING_MAX_SIZE_MB,
	UPLOAD_DELAY_MS,
	callsOf,
	recordingKindOf,
	toRecording,
	totalCalls,
} from '../../callSource.helpers';
import type { UploadedRecording } from '../../callSource.types';
import CallsTable from './CallsTable';
import classes from './ManualUploadModal.module.css';

export interface ManualUploadModalProps {
	opened: boolean;
	onClose: () => void;
	campaignId: string;
}

type ManualTab = 'review' | 'uploaded';

const MAX_BYTES = RECORDING_MAX_SIZE_MB * 1024 * 1024;
/** Stable reference so the store selector does not re-render on every change. */
const NO_UPLOADS: UploadedRecording[] = [];

const cx = (...names: Array<string | false | undefined>) =>
	names.filter(Boolean).join(' ');

/**
 * Manual upload: load single audio files or ZIPs, review the calls they contain,
 * and confirm. Nothing reaches the campaign until the user confirms.
 */
export default function ManualUploadModal({
	opened,
	onClose,
	campaignId,
}: ManualUploadModalProps) {
	const { t } = useTranslation('qa.campaigns');
	const confirmedUploads = useCampaignsStore(
		(state) => state.uploads[campaignId] ?? NO_UPLOADS
	);
	const inputRef = useRef<HTMLInputElement>(null);
	const [dragOver, setDragOver] = useState(false);
	const [tab, setTab] = useState<ManualTab>('review');
	/** Loaded in the modal, waiting for the user's confirmation. */
	const [staged, setStaged] = useState<UploadedRecording[]>([]);

	const stagedCalls = useMemo(() => staged.flatMap(callsOf), [staged]);
	const uploading = confirmedUploads.filter(
		(r) => r.status === 'UPLOADING'
	).length;
	const uploaded = useMemo(
		() => confirmedUploads.filter((r) => r.status === 'UPLOADED'),
		[confirmedUploads]
	);
	const uploadedCalls = useMemo(() => uploaded.flatMap(callsOf), [uploaded]);
	const hasAnyFiles = staged.length > 0 || confirmedUploads.length > 0;

	const openPicker = () => inputRef.current?.click();

	const addFiles = (list: FileList | null) => {
		if (!list || list.length === 0) return;
		const accepted: UploadedRecording[] = [];
		let rejected = 0;
		for (const file of Array.from(list)) {
			const kind = recordingKindOf(file);
			if (kind === null || file.size > MAX_BYTES) {
				rejected += 1;
				continue;
			}
			accepted.push(toRecording(file, kind));
		}
		if (rejected > 0) {
			notifyWarning(
				t('callSource.upload.rejected', {
					count: rejected,
					size: RECORDING_MAX_SIZE_MB,
				})
			);
		}
		if (accepted.length === 0) return;
		// Only staged: the campaign is not touched until the user confirms.
		setStaged((current) => [...current, ...accepted]);
		setTab('review');
	};

	const confirmUpload = () => {
		if (staged.length === 0) return;
		const confirmed = staged.map((recording) => ({
			...recording,
			status: 'UPLOADING' as const,
		}));
		useCampaignsStore.getState().addUploads(campaignId, confirmed);
		// Mocked upload: the files count as uploaded after a moment.
		const ids = confirmed.map((recording) => recording.id);
		window.setTimeout(
			() => useCampaignsStore.getState().markUploaded(campaignId, ids),
			UPLOAD_DELAY_MS
		);
		notifySuccess(
			t('callSource.upload.confirmed', { count: confirmed.length })
		);
		setStaged([]);
		setTab('uploaded');
	};

	const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setDragOver(true);
	};

	const handleDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setDragOver(false);
		addFiles(event.dataTransfer.files);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			openPicker();
		}
	};

	return (
		<Modal
			centered
			onClose={onClose}
			opened={opened}
			size='xl'
			title={t('callSource.manual.title')}
		>
			<div
				onDragLeave={() => setDragOver(false)}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<input
					accept={RECORDINGS_ACCEPT}
					className={classes.hiddenInput}
					multiple
					onChange={(event) => {
						addFiles(event.currentTarget.files);
						// Lets the same file be picked again.
						event.currentTarget.value = '';
					}}
					ref={inputRef}
					type='file'
				/>

				<Stack gap='md'>
					<Text c='dimmed' size='sm'>
						{t('callSource.manual.description')}
					</Text>

					<div
						className={cx(
							classes.dropzone,
							hasAnyFiles && classes.dropzoneCompact,
							dragOver && classes.dropzoneDragOver
						)}
						onClick={openPicker}
						onKeyDown={handleKeyDown}
						role='button'
						tabIndex={0}
					>
						<Stack align='center' gap={4}>
							<IconCloudUpload
								color='var(--mantine-color-dimmed)'
								size={hasAnyFiles ? 24 : 32}
							/>
							<Text fw={600} size='sm'>
								{t('callSource.upload.dropTitle')}
							</Text>
							<Text c='dimmed' size='xs'>
								{t('callSource.upload.dropSubtitle', {
									size: RECORDING_MAX_SIZE_MB,
								})}
							</Text>
						</Stack>
					</div>
					<Text c='dimmed' size='xs'>
						{t('callSource.upload.zipHint')}
					</Text>

					<Tabs
						onChange={(value) => setTab((value as ManualTab) ?? 'review')}
						value={tab}
					>
						<Tabs.List>
							<Tabs.Tab
								rightSection={
									staged.length > 0 ? (
										<Badge circle size='sm'>
											{staged.length}
										</Badge>
									) : undefined
								}
								value='review'
							>
								{t('callSource.upload.tabs.review')}
							</Tabs.Tab>
							<Tabs.Tab
								rightSection={
									confirmedUploads.length > 0 ? (
										<Badge circle color='gray' size='sm'>
											{confirmedUploads.length}
										</Badge>
									) : undefined
								}
								value='uploaded'
							>
								{t('callSource.upload.tabs.uploaded')}
							</Tabs.Tab>
						</Tabs.List>

						<Tabs.Panel pt='md' value='review'>
							{staged.length === 0 ? (
								<Text c='dimmed' size='sm'>
									{t('callSource.upload.reviewEmpty')}
								</Text>
							) : (
								<Stack gap='sm'>
									<Text size='sm'>
										{t('callSource.upload.reviewSummary', {
											files: staged.length,
											calls: totalCalls(staged),
										})}
									</Text>
									<CallsTable calls={stagedCalls} />
									<Text c='dimmed' size='xs'>
										{t('callSource.upload.confirmHint')}
									</Text>
									<Group gap='xs' justify='flex-end'>
										<Button onClick={() => setStaged([])} variant='subtle'>
											{t('callSource.upload.clear')}
										</Button>
										<Button
											leftSection={<IconCheck size={16} />}
											onClick={confirmUpload}
										>
											{t('callSource.upload.confirm')}
										</Button>
									</Group>
								</Stack>
							)}
						</Tabs.Panel>

						<Tabs.Panel pt='md' value='uploaded'>
							<Stack gap='sm'>
								{uploading > 0 ? (
									<Group gap='xs'>
										<Loader size={14} />
										<Text c='dimmed' size='sm'>
											{t('callSource.upload.uploading', { count: uploading })}
										</Text>
									</Group>
								) : null}

								{uploaded.length > 0 ? (
									<>
										<Group gap='xs'>
											<IconCheck
												color='var(--mantine-color-green-6)'
												size={16}
											/>
											<Text size='sm'>
												{t('callSource.upload.summary', {
													files: uploaded.length,
													calls: totalCalls(uploaded),
												})}
											</Text>
										</Group>
										<CallsTable calls={uploadedCalls} />
									</>
								) : uploading === 0 ? (
									<Text c='dimmed' size='sm'>
										{t('callSource.upload.uploadedEmpty')}
									</Text>
								) : null}
							</Stack>
						</Tabs.Panel>
					</Tabs>
				</Stack>
			</div>
		</Modal>
	);
}
