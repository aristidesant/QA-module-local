// CampaignConfigurationPromptEditModal.tsx
import React, { useState } from 'react';
import {
	Textarea,
	Button,
	Paper,
	Group,
	Title,
	ActionIcon,
} from '@mantine/core';
import { IconDeviceFloppy, IconX } from '@tabler/icons-react';
import PromptTemplateSelect from '~/components/PromptTemplateSelect/PromptTemplateSelect';
import { useGetAllPrompts } from '~/modules/prompt-generator/queries/promptGeneratorQueries';
import styles from './CampaignConfigurationPromptEditModal.module.css';

interface CampaignConfigurationPromptEditModalProps {
	initialPrompt: string;
	onClose: () => void;
	onSave: (prompt: string) => void;
}

const CampaignConfigurationPromptEditModal: React.FC<
	CampaignConfigurationPromptEditModalProps
> = ({ initialPrompt, onClose, onSave }) => {
	const [prompt, setPrompt] = useState<string>(initialPrompt);
	const [draft, setDraft] = useState<string>(initialPrompt);
	const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
		null
	);

	// Fetch all prompt templates
	const { data: prompts } = useGetAllPrompts();

	// Handle template selection
	const handleTemplateChange = (value: string | null) => {
		setSelectedTemplateId(value);
		if (!value) return;
		const template = prompts?.find((item) => item.id === Number(value));
		if (template?.generatedPrompt) {
			setDraft(template.generatedPrompt);
		}
	};

	const handleCancel = () => {
		setDraft(prompt);
		onClose();
	};

	const handleSave = () => {
		setPrompt(draft);
		onSave(draft);
		onClose();
	};

	const handleReset = () => {
		setDraft(prompt);
		setSelectedTemplateId(null);
	};

	const isDirty = draft !== prompt;

	return (
		<Paper radius='lg' className={styles.modalShell} withBorder>
			<div className={styles.header}>
				<Title order={2} className={styles.title}>
					AI personality studio
				</Title>
				<ActionIcon
					variant='subtle'
					color='gray'
					onClick={onClose}
					size='lg'
					aria-label='Close editor'
				>
					<IconX size={18} />
				</ActionIcon>
			</div>

			<div className={styles.content}>
				<PromptTemplateSelect
					value={selectedTemplateId}
					withPreview={false}
					onChange={handleTemplateChange}
					description='Choosing a template replaces the current draft content.'
					clearable
					searchable
					size='sm'
					className={styles.templateSelect}
				/>
				<Textarea
					label='Agent brief'
					placeholder='Lay out persona, tone, rules of engagement, escalation paths, and safety guardrails.'
					value={draft}
					onChange={(event) => setDraft(event.currentTarget.value)}
					className={styles.promptTextarea}
					description='Keep sections concise with action-led directives. Use lists for playbooks and guardrails.'
					autosize
					minRows={20}
					maxRows={40}
					autoFocus
				/>
			</div>

			<Group justify='space-between' className={styles.footer}>
				<Button
					variant='subtle'
					color='gray'
					onClick={handleReset}
					disabled={!isDirty}
				>
					Reset
				</Button>
				<Group gap='sm'>
					<Button variant='default' onClick={handleCancel}>
						Cancel
					</Button>
					<Button
						leftSection={<IconDeviceFloppy size={16} />}
						onClick={handleSave}
						disabled={!draft.trim()}
					>
						Save
					</Button>
				</Group>
			</Group>
		</Paper>
	);
};

export default CampaignConfigurationPromptEditModal;
