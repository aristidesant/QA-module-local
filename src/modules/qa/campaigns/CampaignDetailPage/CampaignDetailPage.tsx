import {
	Alert,
	Badge,
	Button,
	Group,
	Skeleton,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import {
	IconAlertTriangle,
	IconClipboardCheck,
	IconEdit,
	IconMessageCircle,
	IconSearch,
	IconTrash,
	IconUpload,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate, useParams } from 'react-router';

import EmptyState from '~/components/EmptyState';
import SectionCard from '~/components/SectionCard';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { getCampaignStatusColor } from '~/modules/qa/constants/badgeColors';
import { useListPageState } from '~/modules/qa/hooks/useListPageState';
import type { Campaign, Conversation } from '~/models/qa';
import {
	campaignConversationsBaseQueryKey,
	campaignsQueryKey,
	useConversationAudioMutation,
	useCampaignConversationsQuery,
	useCampaignQuery,
	useDeleteCampaignMutation,
	useUpdateCampaignMutation,
	useUploadCampaignConversationAudioMutation,
} from '~/queries/qa/campaignsQueries';
import { useDeleteConversationMutation } from '~/queries/qa/conversationsQueries';
import { queryClient } from '~/queries/queryClient';
import { getErrorMessage } from '~/utils/httpClient';
import { notifyError, notifySuccess } from '~/modules/qa/utils/notifications';
import CampaignFormModal from '~/modules/qa/campaigns/components/CampaignFormModal';
import {
	AUDIO_MAX_SIZE_BYTES,
	AUDIO_MAX_SIZE_MB,
} from '../campaigns.constants';
import { buildCampaignPayload } from '../campaigns.helpers';
import type { CampaignFormValues } from '../campaigns.types';
import type { UploadAudioFormValues } from './CampaignDetailPage.types';
import classes from './CampaignDetailPage.module.css';
import AudioPlayerBar from './components/AudioPlayerBar';
import ConversationsTable from './components/ConversationsTable';
import UploadAudioModal from './components/UploadAudioModal';
import UploadConversationsModal from './components/UploadConversationsModal/UploadConversationsModal';

export default function CampaignDetailPage() {
	const { t } = useTranslation('qa.campaigns');
	const navigate = useNavigate();
	const params = useParams();
	const campaignId = Number(params.campaignId);
	const { page, setPage, pageSize, setPageSize, limit, offset, getTotalPages } =
		useListPageState();
	const [search, setSearch] = useState('');
	const [externalRef, setExternalRef] = useState('');
	const [uploadOpen, setUploadOpen] = useState(false);
	const [uploadConversationsOpen, setUploadConversationsOpen] = useState(false);
	const [audioOpen, setAudioOpen] = useState(false);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
	const [audioError, setAudioError] = useState<string | null>(null);
	const [selectedAudioConversation, setSelectedAudioConversation] =
		useState<Conversation | null>(null);
	const [editOpen, setEditOpen] = useState(false);
	const campaignQuery = useCampaignQuery(campaignId);
	const conversationsQuery = useCampaignConversationsQuery(campaignId, {
		pagination: true,
		limit,
		offset,
		q: search.trim() || undefined,
		externalRef: externalRef.trim() || undefined,
		sortBy: 'createdAt',
		orderBy: 'DESC',
	});
	const updateCampaignMutation = useUpdateCampaignMutation(campaignId);
	const deleteCampaignMutation = useDeleteCampaignMutation();
	const uploadAudioMutation =
		useUploadCampaignConversationAudioMutation(campaignId);
	const conversationAudioMutation = useConversationAudioMutation();
	const deleteConversationMutation = useDeleteConversationMutation();
	const campaignForm = useForm<CampaignFormValues>({
		initialValues: {
			name: '',
			description: '',
			status: 'ACTIVE',
			source: '',
		},
		validate: {
			name: (value) =>
				value.trim().length === 0 ? t('validation.nameRequired') : null,
		},
	});
	const uploadAudioForm = useForm<UploadAudioFormValues>({
		initialValues: {
			file: null,
			externalRef: '',
			source: 'MANUAL_UPLOAD',
		},
		validate: {
			file: (value) => {
				if (!value) {
					return t('validation.audioFileRequired');
				}

				const isMp3 =
					value.type === 'audio/mpeg' ||
					value.name.toLowerCase().endsWith('.mp3');

				if (!isMp3) {
					return t('validation.audioFileType');
				}

				if (value.size > AUDIO_MAX_SIZE_BYTES) {
					return t('validation.audioFileSize', { size: AUDIO_MAX_SIZE_MB });
				}

				return null;
			},
			externalRef: (value) =>
				value.trim().length > 150 ? t('validation.externalRefMaxLength') : null,
		},
	});
	const conversations = conversationsQuery.data?.data ?? [];
	const total = conversationsQuery.data?.total ?? 0;
	const totalPages = getTotalPages(total);

	useEffect(
		() => () => {
			if (audioUrl) {
				URL.revokeObjectURL(audioUrl);
			}
		},
		[audioUrl]
	);

	const closeUploadDrawer = () => {
		uploadAudioForm.reset();
		setUploadOpen(false);
	};

	const handleUploadConversations = async (files: File[]) => {
		try {
			// Upload each file
			for (const file of files) {
				await uploadAudioMutation.mutateAsync({
					file,
					externalRef: undefined,
					source: 'MANUAL_UPLOAD',
				});
			}
			await queryClient.invalidateQueries({
				queryKey: campaignConversationsBaseQueryKey(campaignId),
			});
			notifySuccess(t('notifications.audioUploaded'));
		} catch (error) {
			notifyError(error);
		}
	};

	const openEditDrawer = (campaign: Campaign) => {
		campaignForm.setValues({
			name: campaign.name,
			description: campaign.description ?? '',
			status: campaign.status,
			source: campaign.source ?? '',
		});
		campaignForm.clearErrors();
		setEditOpen(true);
	};

	const closeEditDrawer = () => {
		campaignForm.reset();
		setEditOpen(false);
	};

	const closeAudioDrawer = () => {
		setAudioOpen(false);
		setAudioUrl(null);
		setAudioError(null);
		setSelectedAudioConversation(null);
	};

	const submitCampaignUpdate = campaignForm.onSubmit(async (values) => {
		const payload = buildCampaignPayload(values);

		try {
			await updateCampaignMutation.mutateAsync(payload);
			await queryClient.invalidateQueries({ queryKey: campaignsQueryKey });
			notifySuccess(t('notifications.campaignUpdated'));
			closeEditDrawer();
		} catch (error) {
			notifyError(error);
		}
	});

	const confirmDeleteCampaign = () => {
		modals.openConfirmModal({
			title: t('delete.title'),
			centered: true,
			labels: {
				confirm: t('delete.actions.confirm'),
				cancel: t('delete.actions.cancel'),
			},
			confirmProps: { color: 'red' },
			children: (
				<Text size='sm'>
					{t('delete.description', {
						name: campaignQuery.data?.name ?? t('delete.fallbackName'),
					})}
				</Text>
			),
			onConfirm: async () => {
				try {
					await deleteCampaignMutation.mutateAsync(campaignId);
					await queryClient.invalidateQueries({ queryKey: campaignsQueryKey });
					notifySuccess(t('notifications.campaignDeleted'));
					navigate('/qa/campaigns');
				} catch (error) {
					notifyError(error);
				}
			},
		});
	};

	const confirmDeleteConversation = (conversation: Conversation) => {
		modals.openConfirmModal({
			title: t('detail.conversations.delete.title'),
			centered: true,
			labels: {
				confirm: t('detail.conversations.delete.confirm'),
				cancel: t('detail.conversations.delete.cancel'),
			},
			confirmProps: { color: 'red' },
			children: (
				<Text size='sm'>
					{t('detail.conversations.delete.description', {
						name:
							conversation.externalRef ||
							t('detail.conversations.delete.fallbackName'),
					})}
				</Text>
			),
			onConfirm: async () => {
				try {
					await deleteConversationMutation.mutateAsync(conversation.id);
					await queryClient.invalidateQueries({
						queryKey: campaignConversationsBaseQueryKey(campaignId),
					});
					notifySuccess(t('notifications.conversationDeleted'));
					// Don't leave an orphaned player for a conversation that no longer exists.
					if (selectedAudioConversation?.id === conversation.id) {
						closeAudioDrawer();
					}
				} catch (error) {
					notifyError(error);
				}
			},
		});
	};

	const submitUploadAudio = uploadAudioForm.onSubmit(async (values) => {
		if (!values.file) {
			uploadAudioForm.setFieldError('file', t('validation.audioFileRequired'));
			return;
		}

		try {
			await uploadAudioMutation.mutateAsync({
				file: values.file,
				externalRef: values.externalRef.trim() || undefined,
				source: values.source,
			});
			await queryClient.invalidateQueries({
				queryKey: campaignConversationsBaseQueryKey(campaignId),
			});
			notifySuccess(t('notifications.audioUploaded'));
			closeUploadDrawer();
		} catch (error) {
			notifyError(error);
		}
	});

	const openAudioPlayer = async (conversation: Conversation) => {
		setSelectedAudioConversation(conversation);
		setAudioOpen(true);
		setAudioUrl(null);
		setAudioError(null);

		try {
			const audioBlob = await conversationAudioMutation.mutateAsync(
				conversation.id
			);
			setAudioUrl(URL.createObjectURL(audioBlob));
		} catch (error) {
			setAudioError(getErrorMessage(error));
		}
	};

	return (
		<>
			<UploadAudioModal
				form={uploadAudioForm}
				onClose={closeUploadDrawer}
				onSubmit={submitUploadAudio}
				opened={uploadOpen}
				uploading={uploadAudioMutation.isPending}
			/>

			<UploadConversationsModal
				opened={uploadConversationsOpen}
				onClose={() => setUploadConversationsOpen(false)}
				onUpload={handleUploadConversations}
				uploading={uploadAudioMutation.isPending}
				campaignName={campaignQuery.data?.name}
			/>

			<CampaignFormModal
				form={campaignForm}
				onClose={closeEditDrawer}
				onSubmit={submitCampaignUpdate}
				opened={editOpen}
				saving={updateCampaignMutation.isPending}
				submitIcon={<IconEdit size={16} />}
				submitLabel={t('campaignForm.actions.update')}
				title={t('campaignForm.editTitle')}
			/>

			<ContentContainer
				contentWidth='full'
				description={campaignQuery.data?.description || t('detail.description')}
				onBackClick={() => navigate('/qa/campaigns')}
				showBackButton
				title={campaignQuery.data?.name ?? t('detail.title')}
				titleRight={
					<>
						{campaignQuery.data ? (
							<>
								<Badge
									color={getCampaignStatusColor(campaignQuery.data.status)}
									variant='light'
								>
									{t(`status.${campaignQuery.data.status.toLowerCase()}`)}
								</Badge>
								<Button
									leftSection={<IconEdit size={16} />}
									onClick={() => openEditDrawer(campaignQuery.data)}
									size='sm'
									variant='light'
								>
									{t('detail.actions.editCampaign')}
								</Button>
								<Button
									color='red'
									leftSection={<IconTrash size={16} />}
									onClick={confirmDeleteCampaign}
									size='sm'
									variant='subtle'
								>
									{t('detail.actions.deleteCampaign')}
								</Button>
							</>
						) : null}
						{campaignQuery.data?.source ? (
							<Button
								leftSection={<IconUpload size={16} />}
								onClick={() => setUploadConversationsOpen(true)}
								size='sm'
								variant='light'
							>
								Upload Conversations
							</Button>
						) : null}
						<Button
							leftSection={<IconUpload size={16} />}
							onClick={() => setUploadOpen(true)}
							size='sm'
							variant='light'
						>
							{t('detail.actions.uploadAudio')}
						</Button>
						<Button
							component={RouterLink}
							leftSection={<IconClipboardCheck size={16} />}
							size='sm'
							to={`/qa/evaluations/new?campaignId=${campaignId}`}
							variant='light'
						>
							{t('detail.actions.startEvaluation')}
						</Button>
					</>
				}
			>
				<Stack gap='md'>
					{campaignQuery.isError ? (
						<Alert
							color='red'
							icon={<IconAlertTriangle size={16} />}
							title={t('states.errorTitle')}
							variant='light'
						>
							{getErrorMessage(campaignQuery.error)}
						</Alert>
					) : null}

					<SectionCard>
						<Stack gap='sm'>
							<Group className={classes.toolbar} justify='space-between'>
								<Group gap='xs'>
									<TextInput
										leftSection={<IconSearch size={16} />}
										onChange={(event) => {
											setSearch(event.currentTarget.value);
											setPage(1);
										}}
										placeholder={t('detail.filters.searchPlaceholder')}
										size='sm'
										value={search}
									/>
									<TextInput
										onChange={(event) => {
											setExternalRef(event.currentTarget.value);
											setPage(1);
										}}
										placeholder={t('detail.filters.externalRefPlaceholder')}
										size='sm'
										value={externalRef}
									/>
								</Group>
								<Text c='dimmed' size='sm'>
									{t('detail.filters.count', { count: total })}
								</Text>
							</Group>

							{conversationsQuery.isLoading || campaignQuery.isLoading ? (
								<Stack className={classes.tableSkeleton} gap='sm'>
									<Skeleton height={16} width='35%' />
									<Skeleton height={36} />
									<Skeleton height={36} />
									<Skeleton height={36} />
								</Stack>
							) : null}

							{conversationsQuery.isError ? (
								<Alert
									color='red'
									icon={<IconAlertTriangle size={16} />}
									title={t('states.errorTitle')}
									variant='light'
								>
									{getErrorMessage(conversationsQuery.error)}
								</Alert>
							) : null}

							{!conversationsQuery.isLoading &&
							!conversationsQuery.isError &&
							conversations.length === 0 ? (
								<EmptyState
									action={
										<Button
											leftSection={<IconUpload size={16} />}
											onClick={() => setUploadOpen(true)}
											size='sm'
											variant='light'
										>
											{t('detail.actions.uploadAudio')}
										</Button>
									}
									description={t('detail.conversations.empty.description')}
									icon={<IconMessageCircle size={32} />}
									message={t('detail.conversations.empty.title')}
								/>
							) : null}

							{conversations.length > 0 ? (
								<ConversationsTable
									audioPendingId={
										conversationAudioMutation.isPending
											? (selectedAudioConversation?.id ?? null)
											: null
									}
									campaignId={campaignId}
									conversations={conversations}
									onDeleteConversation={confirmDeleteConversation}
									onPageChange={setPage}
									onPageSizeChange={setPageSize}
									onPlayAudio={(conversation) => {
										void openAudioPlayer(conversation);
									}}
									onSeeTranscript={(conversation) => {
										void openAudioPlayer(conversation);
									}}
									page={page}
									pageSize={pageSize}
									totalPages={totalPages}
								/>
							) : null}
						</Stack>
					</SectionCard>

					{audioOpen ? (
						<AudioPlayerBar
							audioUrl={audioUrl}
							conversation={selectedAudioConversation}
							error={audioError}
							loading={conversationAudioMutation.isPending}
							onClose={closeAudioDrawer}
						/>
					) : null}
				</Stack>
			</ContentContainer>
		</>
	);
}
