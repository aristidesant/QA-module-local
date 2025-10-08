import React from 'react';
import { Text, Group, Button, ScrollArea } from '@mantine/core';
import type { CampaignPromptHistoryItem } from '~/models/CampaignPromptHistoryModel';

interface PromptHistoryModalProps {
	item: CampaignPromptHistoryItem;
	onRestore: (promptText: string) => void;
	onClose: () => void;
}

const PromptHistoryModal: React.FC<PromptHistoryModalProps> = ({
	item,
	onRestore,
	onClose,
}) => {
	return (
		<>
			<ScrollArea h='calc(100vh - 120px)'>
				<Text size='sm' style={{ whiteSpace: 'pre-wrap' }}>
					{item.promptText}
				</Text>
			</ScrollArea>
			<Group justify='flex-end' mt='md'>
				<Button variant='default' onClick={onClose}>
					Cancel
				</Button>
				<Button color='green' onClick={() => onRestore(item.promptText)}>
					Restore
				</Button>
			</Group>
		</>
	);
};

export default PromptHistoryModal;
