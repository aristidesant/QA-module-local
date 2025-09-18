import React from 'react';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconEye, IconEdit, IconTrash, IconCopy } from '@tabler/icons-react';
import { useClipboard } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import type { Prompt } from '~/models/PromptModel';
import { usePromptHistoryStore } from '../usePromptHistoryStore';
import { useDeletePrompt } from '~/modules/prompt-generator/queries/promptGeneratorQueries';

interface ActionsMenuProps {
	prompt: Prompt;
}

export const ActionsMenu: React.FC<ActionsMenuProps> = ({ prompt }) => {
	const clipboard = useClipboard({ timeout: 2000 });
	const { openViewModal, openEditModal } = usePromptHistoryStore();
	const { mutateAsync: deletePrompt } = useDeletePrompt();

	const handleCopyPrompt = () => {
		if (prompt.generatedPrompt) {
			clipboard.copy(prompt.generatedPrompt);
			notifications.show({
				title: 'Copied!',
				message: 'Prompt copied to clipboard',
				color: 'green',
			});
		}
	};

	const handleDeletePrompt = () => {
		modals.openConfirmModal({
			title: 'Delete Prompt',
			children:
				'Are you sure you want to delete this prompt? This action cannot be undone.',
			labels: { confirm: 'Delete', cancel: 'Cancel' },
			confirmProps: { color: 'red' },
			onConfirm: async () => {
				try {
					await deletePrompt(String(prompt.id));
					notifications.show({
						title: 'Success!',
						message: 'Prompt deleted successfully',
						color: 'green',
					});
				} catch (error) {
					notifications.show({
						title: 'Error',
						message: 'Failed to delete prompt',
						color: 'red',
					});
				}
			},
		});
	};

	return (
		<Group gap='xs' justify='flex-end'>
			<Tooltip label='View prompt'>
				<ActionIcon
					variant='subtle'
					color='blue'
					size='sm'
					onClick={() => openViewModal(prompt)}
				>
					<IconEye size={16} />
				</ActionIcon>
			</Tooltip>

			<Tooltip label='Copy prompt'>
				<ActionIcon
					variant='subtle'
					color='green'
					size='sm'
					onClick={handleCopyPrompt}
					disabled={!prompt.generatedPrompt}
				>
					<IconCopy size={16} />
				</ActionIcon>
			</Tooltip>

			<Tooltip label='Edit prompt'>
				<ActionIcon
					variant='subtle'
					color='orange'
					size='sm'
					onClick={() => openEditModal(prompt)}
				>
					<IconEdit size={16} />
				</ActionIcon>
			</Tooltip>

			<Tooltip label='Delete prompt'>
				<ActionIcon
					variant='subtle'
					color='red'
					size='sm'
					onClick={handleDeletePrompt}
				>
					<IconTrash size={16} />
				</ActionIcon>
			</Tooltip>
		</Group>
	);
};
