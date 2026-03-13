// CampaignConfigurationToolsAddModal.tsx
import React, { useState, useEffect } from 'react';
import {
	Modal,
	Button,
	Text,
	Checkbox,
	Group,
	ThemeIcon,
	Loader,
} from '@mantine/core';
import { IconPuzzle } from '@tabler/icons-react';
import type { ToolModel } from '~/models/ToolModel';
import { useTranslation } from 'react-i18next';
import classes from './CampaignConfigurationToolsAddModal.module.css';

interface CampaignConfigurationToolsAddModalProps {
	opened: boolean;
	onClose: () => void;
	allTools: ToolModel[];
	selectedIds: string[];
	isLoading?: boolean;
	onSave: (selectedIds: string[]) => void;
}

const CampaignConfigurationToolsAddModal: React.FC<
	CampaignConfigurationToolsAddModalProps
> = ({ opened, onClose, allTools, selectedIds, isLoading, onSave }) => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);

	// Only show tools that are NOT currently active
	const availableTools = allTools.filter(
		(tool) => !selectedIds.includes(tool.identifier)
	);

	// Local selection state — identifiers the user is toggling in this session
	const [localSelected, setLocalSelected] = useState<string[]>([]);

	// Reset local selection whenever the modal opens
	useEffect(() => {
		if (opened) {
			setLocalSelected([]);
		}
	}, [opened]);

	const handleToggle = (identifier: string) => {
		setLocalSelected((prev) =>
			prev.includes(identifier)
				? prev.filter((id) => id !== identifier)
				: [...prev, identifier]
		);
	};

	const handleSave = () => {
		// Merge existing active IDs with the newly selected ones
		onSave([...selectedIds, ...localSelected]);
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('form.agent.tools.modal.title')}
			size='md'
		>
			<div className={classes.modalContent}>
				<Text className={classes.subtitle}>
					{t('form.agent.tools.modal.subtitle')}
				</Text>

				{isLoading ? (
					<div className={classes.loadingContainer}>
						<Loader size='xs' />
					</div>
				) : availableTools.length === 0 ? (
					<Text size='xs' c='dimmed' className={classes.emptyMessage}>
						{t('form.agent.tools.modal.noTools')}
					</Text>
				) : (
					<div className={classes.toolList}>
						{availableTools.map((tool) => {
							const isChecked = localSelected.includes(tool.identifier);
							return (
								<label
									key={tool.identifier}
									className={`${classes.toolRow} ${isChecked ? classes.toolRowChecked : ''}`}
								>
									<Group gap='sm' align='center' wrap='nowrap'>
										<ThemeIcon variant='light' color='violet' size='md'>
											<IconPuzzle size={16} />
										</ThemeIcon>
										<div className={classes.toolInfo}>
											<div className={classes.toolName}>{tool.name}</div>
											<div className={classes.toolMeta}>
												{t('form.agent.tools.customIntegration')}
											</div>
										</div>
										<Checkbox
											checked={isChecked}
											onChange={() => handleToggle(tool.identifier)}
											aria-label={t('form.agent.tools.toggleAria', {
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
							{t('form.agent.tools.modal.cancel')}
						</Button>
						<Button
							size='xs'
							onClick={handleSave}
							disabled={localSelected.length === 0}
						>
							{t('form.agent.tools.modal.save')}
						</Button>
					</Group>
				</div>
			</div>
		</Modal>
	);
};

export default CampaignConfigurationToolsAddModal;
