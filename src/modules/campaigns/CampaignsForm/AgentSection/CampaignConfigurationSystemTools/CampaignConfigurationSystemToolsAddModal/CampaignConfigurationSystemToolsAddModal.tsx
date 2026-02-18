// CampaignConfigurationSystemToolsAddModal.tsx
import React, { useState, useEffect } from 'react';
import {
	Modal,
	Button,
	Text,
	Checkbox,
	Group,
	ThemeIcon,
	Badge,
} from '@mantine/core';
import { IconCpu } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { SystemToolModel } from '~/models/AgentListObject';
import classes from './CampaignConfigurationSystemToolsAddModal.module.css';

type ToolConfigModel = {
	name: string;
	nameCode: string;
	description?: string;
	value: SystemToolModel;
};

interface CampaignConfigurationSystemToolsAddModalProps {
	opened: boolean;
	onClose: () => void;
	allTools: ToolConfigModel[];
	activeNameCodes: string[];
	onSave: (selectedNameCodes: string[]) => void;
}

const CampaignConfigurationSystemToolsAddModal: React.FC<
	CampaignConfigurationSystemToolsAddModalProps
> = ({ opened, onClose, allTools, activeNameCodes, onSave }) => {
	const { t } = useTranslation('campaigns');

	// Only show tools that are NOT currently active
	const availableTools = allTools.filter(
		(tool) => !activeNameCodes.includes(tool.nameCode)
	);

	const [localSelected, setLocalSelected] = useState<string[]>([]);

	useEffect(() => {
		if (opened) {
			setLocalSelected([]);
		}
	}, [opened]);

	const handleToggle = (nameCode: string) => {
		setLocalSelected((prev) =>
			prev.includes(nameCode)
				? prev.filter((id) => id !== nameCode)
				: [...prev, nameCode]
		);
	};

	const handleSave = () => {
		onSave(localSelected);
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('form.agent.systemTools.addModal.title')}
			size='md'
		>
			<div className={classes.modalContent}>
				<Text className={classes.subtitle}>
					{t('form.agent.systemTools.addModal.subtitle')}
				</Text>

				{availableTools.length === 0 ? (
					<Text size='xs' c='dimmed' className={classes.emptyMessage}>
						{t('form.agent.systemTools.addModal.noTools')}
					</Text>
				) : (
					<div className={classes.toolList}>
						{availableTools.map((tool) => {
							const isChecked = localSelected.includes(tool.nameCode);
							return (
								<label
									key={tool.nameCode}
									className={`${classes.toolRow} ${isChecked ? classes.toolRowChecked : ''}`}
								>
									<Group gap='sm' align='center' wrap='nowrap'>
										<ThemeIcon variant='light' color='cyan' size='md'>
											<IconCpu size={16} />
										</ThemeIcon>
										<div className={classes.toolInfo}>
											<Group gap={6} align='center'>
												<div className={classes.toolName}>{tool.name}</div>
												{tool.value?.type && (
													<Badge size='xs' variant='light' color='cyan'>
														{tool.value.type}
													</Badge>
												)}
											</Group>
											<div className={classes.toolMeta}>
												{t('form.agent.systemTools.systemUtility')}
											</div>
										</div>
										<Checkbox
											checked={isChecked}
											onChange={() => handleToggle(tool.nameCode)}
											aria-label={t('form.agent.systemTools.toggleAria', {
												name: tool.name,
											})}
											ml='auto'
										/>
									</Group>
								</label>
							);
						})}
					</div>
				)}

				<div className={classes.footer}>
					<Text size='xs' c='dimmed'>
						{localSelected.length > 0 ? `${localSelected.length} selected` : ''}
					</Text>
					<Group gap='xs'>
						<Button variant='subtle' size='xs' onClick={onClose}>
							{t('form.agent.systemTools.addModal.cancel')}
						</Button>
						<Button
							size='xs'
							onClick={handleSave}
							disabled={localSelected.length === 0}
						>
							{t('form.agent.systemTools.addModal.save')}
						</Button>
					</Group>
				</div>
			</div>
		</Modal>
	);
};

export default CampaignConfigurationSystemToolsAddModal;
