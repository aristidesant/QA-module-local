import React from 'react';
import {
	Modal,
	Stack,
	Textarea,
	Checkbox,
	Button,
	Group,
	Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import type { SystemToolModel } from '~/models/AgentListObject';
import classes from './ToolConfigModal.module.css';
import { useTranslation } from 'react-i18next';

interface ToolConfigModalProps {
	opened: boolean;
	onClose: () => void;
	toolName: string;
	toolConfig: SystemToolModel;
	onSave: (updatedConfig: SystemToolModel) => void;
}

const ToolConfigModal: React.FC<ToolConfigModalProps> = ({
	opened,
	onClose,
	toolName,
	toolConfig,
	onSave,
}) => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const form = useForm({
		initialValues: {
			description: toolConfig.description || '',
			disableInterruptions: toolConfig.disableInterruptions || false,
			voicemailMessage: toolConfig.params?.voicemailMessage || '',
		},
	});

	const handleSave = () => {
		const values = form.values;
		const updatedConfig: SystemToolModel = {
			...toolConfig,
			description: values.description,
			disableInterruptions: values.disableInterruptions,
		};

		// Only add voicemailMessage if the tool is voicemail_detection
		if (toolConfig.name === 'voicemail_detection') {
			updatedConfig.params = {
				...toolConfig.params,
				voicemailMessage: values.voicemailMessage,
			};
		}

		onSave(updatedConfig);
		onClose();
	};

	const isVoicemailDetection = toolConfig.name === 'voicemail_detection';

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('form.agent.systemTools.modal.title')}
			size='lg'
			classNames={{
				title: classes.modalTitle,
			}}
		>
			<Stack gap='md'>
				<div>
					<Text fw={600} size='sm' mb={4}>
						{t('form.agent.systemTools.modal.name')}
					</Text>
					<div className={classes.nameDisplay}>{toolName}</div>
				</div>

				<div>
					<Text fw={600} size='sm' mb={4}>
						{t('form.agent.systemTools.modal.description.label')}
					</Text>
					<Textarea
						placeholder={t(
							'form.agent.systemTools.modal.description.placeholder'
						)}
						minRows={4}
						maxRows={8}
						autosize
						{...form.getInputProps('description')}
					/>
				</div>

				<Checkbox
					label={t('form.agent.systemTools.modal.interruptions.label')}
					description={t(
						'form.agent.systemTools.modal.interruptions.description'
					)}
					{...form.getInputProps('disableInterruptions', {
						type: 'checkbox',
					})}
				/>

				{isVoicemailDetection && (
					<div>
						<Text fw={600} size='sm' mb={4}>
							{t('form.agent.systemTools.modal.voicemail.title')}
						</Text>
						<Text size='xs' c='dimmed' mb='xs'>
							{t('form.agent.systemTools.modal.voicemail.description')}
						</Text>

						<div className={classes.voicemailSection}>
							<Text fw={500} size='xs' mb={4}>
								{t('form.agent.systemTools.modal.voicemail.messageLabel')}
							</Text>
							<Textarea
								placeholder={t(
									'form.agent.systemTools.modal.voicemail.messagePlaceholder'
								)}
								minRows={4}
								autosize
								{...form.getInputProps('voicemailMessage')}
							/>
							<Text size='xs' c='dimmed' mt={4}>
								{t('form.agent.systemTools.modal.voicemail.hint')}
							</Text>
						</div>
					</div>
				)}

				<Group justify='flex-end' mt='md'>
					<Button variant='subtle' onClick={onClose} size='sm'>
						{t('form.agent.systemTools.modal.actions.cancel')}
					</Button>
					<Button onClick={handleSave} size='sm'>
						{t('form.agent.systemTools.modal.actions.save')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};

export default ToolConfigModal;
