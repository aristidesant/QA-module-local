// CampaignConfigurationKnowledgeBaseAddModal.tsx
import React, { useState } from 'react';
import { Modal, Stack, Switch, Button, Group, Text } from '@mantine/core';
import type KnowledgeBaseModel from '~/models/KnowledgeBaseModel';

interface CampaignConfigurationKnowledgeBaseAddModalProps {
	opened: boolean;
	onClose: () => void;
	selectedIds: number[];
	onSave: (selectedIds: number[]) => void;
	allKnowledgeBases: KnowledgeBaseModel[];
}

const CampaignConfigurationKnowledgeBaseAddModal: React.FC<
	CampaignConfigurationKnowledgeBaseAddModalProps
> = ({ opened, onClose, selectedIds, onSave, allKnowledgeBases }) => {
	const [tempSelectedIds, setTempSelectedIds] = useState<number[]>(selectedIds);

	React.useEffect(() => {
		if (opened) {
			setTempSelectedIds(selectedIds);
		}
	}, [opened, selectedIds]);

	const handleToggle = (kbId: number, checked: boolean) => {
		if (checked) {
			setTempSelectedIds((prev) => [...prev, kbId]);
		} else {
			setTempSelectedIds((prev) => prev.filter((id) => id !== kbId));
		}
	};

	const handleSave = () => {
		onSave(tempSelectedIds);
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title='Select Knowledge Bases'
			size='lg'
		>
			<Stack>
				{allKnowledgeBases.length > 0 ? (
					allKnowledgeBases.map((kb) => (
						<Switch
							key={kb.id}
							label={kb.name}
							description={kb.description}
							checked={tempSelectedIds.includes(kb.id)}
							onChange={(event) =>
								handleToggle(kb.id, event.currentTarget.checked)
							}
						/>
					))
				) : (
					<Text size='sm' c='dimmed'>
						No knowledge bases available
					</Text>
				)}
			</Stack>
			<Group justify='flex-end' mt='md'>
				<Button variant='default' onClick={onClose}>
					Cancel
				</Button>
				<Button onClick={handleSave}>Save Selections</Button>
			</Group>
		</Modal>
	);
};

export default CampaignConfigurationKnowledgeBaseAddModal;
