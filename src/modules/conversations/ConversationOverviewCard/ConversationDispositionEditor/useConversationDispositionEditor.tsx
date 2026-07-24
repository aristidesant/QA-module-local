import { Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useIsSuperAdmin from '~/hooks/useIsSuperAdmin';
import type { CallDispositionModel } from '~/models/CallDispositionModel';
import { useGetCampaignDispositions } from '~/queries/campaignsQueries';
import {
	isTerminalConversationStatus,
	useUpdateConversationDisposition,
} from '~/queries/conversationsQueries';
import { useSessionStore } from '~/stores/sessionStore';
import {
	getDispositionLoadErrorKey,
	getDispositionPath,
	getDispositionUpdateErrorKey,
} from './ConversationDispositionEditor.helpers';

interface UseConversationDispositionEditorParams {
	campaignId?: string | number;
	conversationId?: string | number;
	conversationStatus?: string;
	currentDisposition?: CallDispositionModel;
}

export const useConversationDispositionEditor = ({
	campaignId,
	conversationId,
	conversationStatus,
	currentDisposition,
}: UseConversationDispositionEditorParams) => {
	const { t } = useTranslation('conversations');
	const isSuperAdmin = useIsSuperAdmin();
	const { user, targetClient } = useSessionStore();
	const activeClientId =
		targetClient?.id ?? user?.clientId ?? user?.client?.id ?? null;
	const editorContext = `${activeClientId ?? 'none'}:${campaignId ?? 'none'}:${conversationId ?? 'none'}`;
	const [editorState, setEditorState] = useState<{
		context: string;
		isEditing: boolean;
		selectedId: string | null;
	}>({
		context: editorContext,
		isEditing: false,
		selectedId: null,
	});

	const isCurrentContext = editorState.context === editorContext;
	const isEditing = isCurrentContext && editorState.isEditing;
	const selectedDispositionId = isCurrentContext
		? editorState.selectedId
		: null;
	const canEdit =
		isSuperAdmin && isTerminalConversationStatus(conversationStatus);

	const {
		data: options = [],
		isLoading,
		isError,
		error,
		refetch,
	} = useGetCampaignDispositions(campaignId, {
		enabled: canEdit && isEditing,
	});
	const updateMutation = useUpdateConversationDisposition();
	const selectedDisposition = options.find(
		(option) => String(option.id) === selectedDispositionId
	);

	const resetEditor = (nextIsEditing: boolean) => {
		setEditorState({
			context: editorContext,
			isEditing: nextIsEditing,
			selectedId: null,
		});
	};

	const open = () => resetEditor(true);

	const cancel = () => {
		if (updateMutation.isPending) return;
		resetEditor(false);
	};

	const changeSelection = (selectedId: string | null) => {
		setEditorState({
			context: editorContext,
			isEditing: true,
			selectedId,
		});
	};

	const save = () => {
		if (!conversationId || !selectedDisposition) return;

		const selectedPath = getDispositionPath(selectedDisposition);
		const modalId = `change-conversation-disposition-${conversationId}`;

		modals.openConfirmModal({
			modalId,
			centered: true,
			closeOnConfirm: false,
			title: t('disposition.edit.confirmTitle'),
			children: (
				<Stack gap='xs'>
					<Text size='sm'>{t('disposition.edit.confirmDescription')}</Text>
					<Text size='sm'>
						<strong>{t('disposition.edit.currentLabel')}:</strong>{' '}
						{currentDisposition?.dispositionName || t('disposition.noOutcome')}
					</Text>
					<Text size='sm'>
						<strong>{t('disposition.edit.newLabel')}:</strong> {selectedPath}
					</Text>
				</Stack>
			),
			labels: {
				confirm: t('disposition.edit.confirm'),
				cancel: t('disposition.edit.cancel'),
			},
			onConfirm: async () => {
				modals.updateModal({
					modalId,
					confirmProps: { loading: true },
					cancelProps: { disabled: true },
					closeOnClickOutside: false,
					closeOnEscape: false,
				});

				try {
					await updateMutation.mutateAsync({
						conversationId,
						dispositionId: selectedDisposition.id,
					});
					modals.close(modalId);
					resetEditor(false);
					notifications.show({
						title: t('disposition.edit.successTitle'),
						message: t('disposition.edit.successMessage', {
							name: selectedDisposition.name,
						}),
						color: 'green',
					});
				} catch (updateError) {
					modals.close(modalId);
					notifications.show({
						title: t('disposition.edit.errorTitle'),
						message: t(getDispositionUpdateErrorKey(updateError)),
						color: 'red',
					});
				}
			},
		});
	};

	return {
		canEdit,
		isEditing,
		editorProps: {
			options,
			selectedDispositionId,
			isLoading,
			isError,
			isPending: updateMutation.isPending,
			loadErrorMessage: t(getDispositionLoadErrorKey(error)),
			onChange: changeSelection,
			onCancel: cancel,
			onSave: save,
			onRetry: () => void refetch(),
		},
		open,
	};
};
