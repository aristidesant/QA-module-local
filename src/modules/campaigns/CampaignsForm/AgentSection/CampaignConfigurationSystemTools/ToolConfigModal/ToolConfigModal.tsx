import React from 'react';
import { Modal, Stack, Textarea, Checkbox } from '@mantine/core';
import { useForm } from '@mantine/form';
import type { SystemToolModel } from '~/models/AgentListObject';
import classes from './ToolConfigModal.module.css';

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
			title='Configuration'
			size='lg'
			classNames={{
				title: classes.modalTitle,
			}}
		>
			<Stack gap='md'>
				<div>
					<h3 className={classes.sectionTitle}>Name</h3>
					<div className={classes.nameDisplay}>{toolName}</div>
				</div>

				<div>
					<h3 className={classes.sectionTitle}>Description (optional)</h3>
					<Textarea
						placeholder='Leave blank to use the default optimized LLM prompt.'
						minRows={4}
						autosize
						{...form.getInputProps('description')}
					/>
				</div>

				<Checkbox
					label='Disable interruptions'
					description='Select this box to disable interruptions while the tool is running.'
					{...form.getInputProps('disableInterruptions', {
						type: 'checkbox',
					})}
				/>

				{isVoicemailDetection && (
					<div>
						<h3 className={classes.sectionTitle}>Voicemail Configuration</h3>
						<p className={classes.sectionDescription}>
							Configure the message to leave when voicemail is detected.
						</p>

						<div className={classes.voicemailSection}>
							<h4 className={classes.voicemailLabel}>
								Voicemail Message (optional)
							</h4>
							<Textarea
								placeholder='Hello, this is an automated call from [Company Name]. Please call us back at your convenience. Thank you.'
								minRows={4}
								autosize
								{...form.getInputProps('voicemailMessage')}
							/>
							<p className={classes.voicemailHint}>
								Leave blank to end the call immediately when voicemail is
								detected. If provided, this message will be played before ending
								the call.
							</p>
						</div>
					</div>
				)}

				<div className={classes.buttonGroup}>
					<button
						type='button'
						onClick={onClose}
						className={classes.cancelButton}
					>
						Cancel
					</button>
					<button
						type='button'
						onClick={handleSave}
						className={classes.saveButton}
					>
						Save
					</button>
				</div>
			</Stack>
		</Modal>
	);
};

export default ToolConfigModal;
