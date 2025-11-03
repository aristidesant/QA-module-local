// CampaignConfigurationPromptEditModal.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
	Button,
	Paper,
	Group,
	Title,
	ActionIcon,
	Select,
	Badge,
	Stack,
	Text,
} from '@mantine/core';
import MDEditor from '@uiw/react-md-editor';
import { IconDeviceFloppy, IconX, IconInfoCircle } from '@tabler/icons-react';
import PromptTemplateSelect from '~/components/PromptTemplateSelect/PromptTemplateSelect';
import { useGetAllPrompts } from '~/modules/prompt-generator/queries/promptGeneratorQueries';
import styles from './CampaignConfigurationPromptEditModal.module.css';
import { useGetCampaignContactSchemas } from '~/queries/campaignContactSchemasQueries';
import type { CampaignContactSchema } from '~/models/CampaignContactSchemaModel';
import '@uiw/react-md-editor/markdown-editor.css';
import { notifications } from '@mantine/notifications';
import { useClientConfigByName } from '~/queries/useClientConfigs';

interface CampaignConfigurationPromptEditModalProps {
	initialPrompt: string;
	onClose: () => void;
	// Include selected schema id in save
	onSave: (prompt: string, schemaId?: number) => void;
	initialSchemaId?: number;
}

const CampaignConfigurationPromptEditModal: React.FC<
	CampaignConfigurationPromptEditModalProps
> = ({ initialPrompt, onClose, onSave, initialSchemaId }) => {
	const [prompt, setPrompt] = useState<string>(initialPrompt);
	const [draft, setDraft] = useState<string>(initialPrompt);
	const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
		null
	);
	const [selectedSchemaId, setSelectedSchemaId] = useState<string | undefined>(
		initialSchemaId ? String(initialSchemaId) : undefined
	);

	// Fetch all prompt templates
	const { data: prompts } = useGetAllPrompts();

	// Fetch available contact schemas
	const { data: schemasResponse } = useGetCampaignContactSchemas(
		{ isActive: true },
		true
	);

	// Fetch suggestion_prompt from client-config
	const { data: suggestionPromptConfig } =
		useClientConfigByName('suggestion_prompt');

	// Auto-select first available schema if none provided
	useEffect(() => {
		if (!selectedSchemaId && schemasResponse?.data?.length) {
			setSelectedSchemaId(String(schemasResponse.data[0].id));
		}
	}, [selectedSchemaId, schemasResponse?.data]);

	// Resolve current schema
	const currentSchema: CampaignContactSchema | undefined =
		schemasResponse?.data.find((s) => s.id === Number(selectedSchemaId));

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

	const handleVariableCopy = useCallback(
		(variable: string, isPrompt = false) => {
			const copy = async () => {
				try {
					if (
						typeof navigator !== 'undefined' &&
						navigator.clipboard?.writeText
					) {
						await navigator.clipboard.writeText(variable);
					} else {
						const textarea = document.createElement('textarea');
						textarea.value = variable;
						textarea.setAttribute('readonly', '');
						textarea.style.position = 'absolute';
						textarea.style.left = '-9999px';
						document.body.appendChild(textarea);
						textarea.select();
						document.execCommand('copy');
						document.body.removeChild(textarea);
					}
					notifications.show({
						color: 'blue',
						title: isPrompt ? 'Prompt copied' : 'Variable copied',
						message: isPrompt
							? 'The prompt has been copied to the clipboard.'
							: `${variable} copied to clipboard.`,
					});
				} catch (error) {
					notifications.show({
						color: 'red',
						title: 'Copy failed',
						message: 'Unable to copy variable. Please try again.',
					});
				}
			};

			void copy();
		},
		[]
	);

	// Prepare schema options
	const schemaOptions =
		schemasResponse?.data.map((schema) => ({
			value: String(schema.id),
			label: schema.name,
		})) || [];

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
				<div className={styles.editorColumn}>
					<div className={styles.controlsGrid}>
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
					</div>

					<div className={styles.editorCard}>
						<div className={styles.editorHeading}>
							<Text fw={600} size='sm' className={styles.editorLabel}>
								Agent brief
							</Text>
							<Text size='sm' c='dimmed'>
								Lay out persona, tone, rules of engagement, escalation paths,
								and guardrails.
							</Text>
						</div>
						<div className={styles.markdownEditor}>
							<MDEditor
								value={draft}
								onChange={(value) => setDraft(value ?? '')}
								height={420}
								preview='edit'
								data-color-mode='light'
								textareaProps={{
									placeholder:
										'Write a clear, directive prompt with sections for persona, tone, playbooks, and safety measures.',
									autoFocus: true,
								}}
							/>
						</div>
					</div>
				</div>

				<aside className={styles.sidebar}>
					<div className={styles.sidebarCard}>
						<Group gap='xs'>
							<IconInfoCircle size={16} className={styles.sidebarIcon} />
							<Text fw={600} size='sm' className={styles.sidebarTitle}>
								Suggested init prompt
							</Text>
						</Group>
						{suggestionPromptConfig?.value ? (
							<>
								<Text size='xs' c='dimmed'>
									Copy this time-aware greeting template to start your prompt.
								</Text>
								<Stack gap='xs' className={styles.variablesStack}>
									<Button
										variant='outline'
										size='xs'
										fullWidth
										onClick={() =>
											handleVariableCopy(suggestionPromptConfig.value, true)
										}
									>
										Copy init prompt
									</Button>
								</Stack>
							</>
						) : (
							<Text size='xs' c='dimmed'>
								There are no suggestions for prompt. To enable this feature, go
								to client-config and add a property called "suggestion_prompt".
							</Text>
						)}
					</div>

					<div className={styles.sidebarCard}>
						<Select
							label='Contact schema'
							placeholder='Select a contact schema'
							description='Choose a schema to expose dynamic variables from your contact data.'
							value={selectedSchemaId}
							onChange={(value) => setSelectedSchemaId(value || undefined)}
							data={schemaOptions}
							clearable
							searchable
							size='sm'
							className={styles.schemaSelect}
						/>
						<Group gap='xs'>
							<IconInfoCircle size={16} className={styles.sidebarIcon} />
							<Text fw={600} size='sm' className={styles.sidebarTitle}>
								Dynamic variables
							</Text>
						</Group>
						<Text size='xs' c='dimmed'>
							Wrap variables in double curly braces to merge contact data into
							your brief.
						</Text>
						{currentSchema && currentSchema.schemaFields?.length ? (
							<Stack gap='xs' className={styles.variablesStack}>
								<Text size='xs' fw={500} c='dimmed'>
									Schema: {currentSchema.name}
								</Text>
								<Group gap='xs' className={styles.variablesList}>
									{currentSchema.schemaFields.map((field) => (
										<Badge
											key={field.name}
											variant='outline'
											color='blue'
											className={styles.variableBadge}
											title={field.description || field.label}
											component='button'
											type='button'
											onClick={() => handleVariableCopy(`{{${field.name}}}`)}
											aria-label={`Copy variable {{${field.name}}} to clipboard`}
										>
											{`{{${field.name}}}`}
										</Badge>
									))}
								</Group>
							</Stack>
						) : (
							<Text size='sm' c='dimmed'>
								Select a contact schema to see the variables available for
								templating.
							</Text>
						)}
					</div>

					<div className={styles.sidebarCard}>
						<Group gap='xs'>
							<IconInfoCircle size={16} className={styles.sidebarIcon} />
							<Text fw={600} size='sm' className={styles.sidebarTitle}>
								Static variables
							</Text>
						</Group>
						<Text size='xs' c='dimmed'>
							Default contact variables available in all campaigns.
						</Text>
						<Stack gap='xs' className={styles.variablesStack}>
							<Group gap='xs' className={styles.variablesList}>
								{[
									'firstName',
									'lastName',
									'identifier',
									'identifierType',
									'address',
								].map((field) => (
									<Badge
										key={field}
										variant='outline'
										color='blue'
										className={styles.variableBadge}
										component='button'
										type='button'
										onClick={() => handleVariableCopy(`{{${field}}}`)}
										aria-label={`Copy variable {{${field}}} to clipboard`}
									>
										{`{{${field}}}`}
									</Badge>
								))}
							</Group>
						</Stack>
					</div>
				</aside>
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
