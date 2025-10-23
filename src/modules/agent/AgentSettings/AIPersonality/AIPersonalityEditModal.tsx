// AIPersonalityEditModal.tsx
import React, { useState, useEffect } from 'react';
import {
	Textarea,
	Button,
	Paper,
	Group,
	Title,
	ActionIcon,
	Text,
	Stack,
	Badge,
	Accordion,
	Select,
} from '@mantine/core';
import { IconDeviceFloppy, IconX, IconInfoCircle } from '@tabler/icons-react';
import PromptTemplateSelect from '~/components/PromptTemplateSelect/PromptTemplateSelect';
import { useGetAllPrompts } from '~/modules/prompt-generator/queries/promptGeneratorQueries';
import {
	useGetActiveSchemaByCampaignId,
	useGetCampaignContactSchemas,
} from '~/queries/campaignContactSchemasQueries';
import { useCampaignsStore } from '~/stores/campaignsStore';
import styles from './AIPersonalityEditModal.module.css';

interface AIPersonalityEditModalProps {
	initialPrompt: string;
	campaignId?: number;
	initialSchemaId?: number;
	onClose: () => void;
	onSave: (prompt: string, schemaId?: number) => void;
}

const AIPersonalityEditModal: React.FC<AIPersonalityEditModalProps> = ({
	initialPrompt,
	campaignId,
	initialSchemaId,
	onClose,
	onSave,
}) => {
	const [prompt, setPrompt] = useState<string>(initialPrompt);
	const [draft, setDraft] = useState<string>(initialPrompt);
	const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
		null
	);
	const [selectedSchemaId, setSelectedSchemaId] = useState<string | undefined>(
		initialSchemaId ? String(initialSchemaId) : undefined
	);

	const selectedCampaign = useCampaignsStore((state) => state.selectedCampaign);

	// Use the provided campaignId or fall back to selected campaign from store
	const activeCampaignId = campaignId || selectedCampaign?.id;

	// Fetch all prompt templates
	const { data: prompts } = useGetAllPrompts();

	// Fetch all available contact schemas
	const { data: schemasResponse } = useGetCampaignContactSchemas(
		{ isActive: true },
		true
	);

	// Fetch active contact schema for the campaign (for auto-selection)
	const { data: activeSchema } = useGetActiveSchemaByCampaignId(
		activeCampaignId,
		!!activeCampaignId && !selectedSchemaId
	);

	// Debug logs
	console.log('[AIPersonalityEditModal] Debug Info:', {
		campaignId,
		activeCampaignId,
		initialSchemaId,
		selectedSchemaId,
		schemasCount: schemasResponse?.data?.length,
		activeSchema,
		schemaOptions: schemasResponse?.data.map((s) => ({
			id: s.id,
			name: s.name,
		})),
	});

	// Auto-select the active schema if available and no schema is already selected
	useEffect(() => {
		if (activeSchema && !selectedSchemaId && !initialSchemaId) {
			setSelectedSchemaId(String(activeSchema.id));
		}
	}, [activeSchema, selectedSchemaId, initialSchemaId]);

	// Get the currently selected schema from the list
	const currentSchema = schemasResponse?.data.find(
		(schema) => schema.id === Number(selectedSchemaId)
	);

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
		onSave(draft, selectedSchemaId ? Number(selectedSchemaId) : undefined);
		onClose();
	};

	const handleReset = () => {
		setDraft(prompt);
		setSelectedTemplateId(null);
	};

	const isDirty = draft !== prompt;

	// Prepare schema options for the Select component
	const schemaOptions =
		schemasResponse?.data.map((schema) => ({
			value: String(schema.id),
			label: schema.name,
		})) || [];

	console.log('[AIPersonalityEditModal] Render Info:', {
		schemaOptionsCount: schemaOptions.length,
		currentSchemaId: selectedSchemaId,
		currentSchema: currentSchema?.name,
	});

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

				<Select
					label='Contact Schema'
					placeholder='Select a contact schema'
					description='Choose a schema to use dynamic variables from contact data in your prompt.'
					value={selectedSchemaId}
					onChange={(value) => setSelectedSchemaId(value || undefined)}
					data={schemaOptions}
					clearable
					searchable
					size='sm'
					className={styles.schemaSelect}
				/>

				{currentSchema &&
					currentSchema.schemaFields &&
					currentSchema.schemaFields.length > 0 && (
						<Accordion
							className={styles.variablesAccordion}
							defaultValue='variables'
						>
							<Accordion.Item value='variables'>
								<Accordion.Control icon={<IconInfoCircle size={18} />}>
									<Text size='sm' fw={500}>
										Available dynamic variables from "{currentSchema.name}"
									</Text>
								</Accordion.Control>
								<Accordion.Panel>
									<Stack gap='xs'>
										<Text size='xs' c='dimmed'>
											Use these variables in your prompt by wrapping them in
											double curly braces, e.g., {`{{firstName}}`}
										</Text>
										<Group gap='xs' className={styles.variablesList}>
											{currentSchema.schemaFields.map((field) => (
												<Badge
													key={field.name}
													variant='light'
													color='blue'
													className={styles.variableBadge}
													title={field.description || field.label}
												>
													{field.name}
												</Badge>
											))}
										</Group>
									</Stack>
								</Accordion.Panel>
							</Accordion.Item>
						</Accordion>
					)}

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

export default AIPersonalityEditModal;
