import React from 'react';
import {
	Stack,
	Group,
	Button,
	Textarea,
	Text,
	Collapse,
	UnstyledButton,
	Box,
	Tooltip,
} from '@mantine/core';
import {
	IconChevronDown,
	IconChevronRight,
	IconPencil,
	IconCheck,
	IconX,
	IconWritingSign,
	IconSparkles,
} from '@tabler/icons-react';
import {
	LABELS,
	DESCRIPTIONS,
	PLACEHOLDERS,
	type PromptMode,
} from '../constants';
import styles from '../PromptAiActions.module.css';

type ComposeStepProps = {
	mode: PromptMode | null;
	systemPromptExpanded: boolean;
	systemPromptEditing: boolean;
	systemPromptContent: string;
	promptToImprove: string;
	userInstructions: string;
	error: string | undefined;
	isPending: boolean;
	onSystemPromptExpandToggle: () => void;
	onSystemPromptEditStart: () => void;
	onSystemPromptEditEnd: () => void;
	onSystemPromptReset: () => void;
	onSystemPromptChange: (value: string) => void;
	onPromptToImproveChange: (value: string) => void;
	onUserInstructionsChange: (value: string) => void;
	onGenerate: () => void;
	onCancel: () => void;
};

const ComposeStep: React.FC<ComposeStepProps> = ({
	mode,
	systemPromptExpanded,
	systemPromptEditing,
	systemPromptContent,
	promptToImprove,
	userInstructions,
	error,
	isPending,
	onSystemPromptExpandToggle,
	onSystemPromptEditStart,
	onSystemPromptEditEnd,
	onSystemPromptReset,
	onSystemPromptChange,
	onPromptToImproveChange,
	onUserInstructionsChange,
	onGenerate,
	onCancel,
}) => {
	const label = mode ? LABELS[mode] : LABELS.create;
	const description = mode ? DESCRIPTIONS[mode] : DESCRIPTIONS.create;
	const placeholder = mode ? PLACEHOLDERS[mode] : PLACEHOLDERS.create;

	return (
		<Stack gap='md'>
			{/* Collapsible System Prompt Section */}
			<Box className={styles.systemPromptSection}>
				<UnstyledButton
					className={styles.systemPromptHeader}
					onClick={onSystemPromptExpandToggle}
				>
					<Group gap='xs'>
						{systemPromptExpanded ? (
							<IconChevronDown size={16} />
						) : (
							<IconChevronRight size={16} />
						)}
						<Text size='sm' fw={500}>
							System prompt
						</Text>
					</Group>
					<Group gap='xs'>
						{!systemPromptExpanded && (
							<Text size='xs' c='dimmed' className={styles.systemPromptPreview}>
								{systemPromptContent.slice(0, 60)}...
							</Text>
						)}
						{systemPromptExpanded && !systemPromptEditing && (
							<Tooltip label='Edit system prompt' withArrow>
								<UnstyledButton
									className={styles.editButton}
									onClick={(e) => {
										e.stopPropagation();
										onSystemPromptEditStart();
									}}
								>
									<IconPencil size={14} />
								</UnstyledButton>
							</Tooltip>
						)}
					</Group>
				</UnstyledButton>

				<Collapse in={systemPromptExpanded}>
					<Box className={styles.systemPromptContent}>
						{systemPromptEditing ? (
							<Stack gap='xs'>
								<Textarea
									value={systemPromptContent}
									onChange={(e) => onSystemPromptChange(e.currentTarget.value)}
									minRows={8}
									autosize
									className={styles.systemPromptTextarea}
								/>
								<Group gap='xs' justify='flex-end'>
									<Button
										variant='subtle'
										size='xs'
										color='gray'
										leftSection={<IconX size={14} />}
										onClick={onSystemPromptReset}
									>
										Reset
									</Button>
									<Button
										variant='light'
										size='xs'
										leftSection={<IconCheck size={14} />}
										onClick={onSystemPromptEditEnd}
									>
										Done
									</Button>
								</Group>
							</Stack>
						) : (
							<Text size='xs' className={styles.systemPromptText}>
								{systemPromptContent}
							</Text>
						)}
					</Box>
				</Collapse>
			</Box>

			{/* Prompt to Improve - Only shown in improve mode */}
			{mode === 'improve' && (
				<Textarea
					label='Prompt to improve'
					description='This is your current prompt that will be enhanced by AI'
					value={promptToImprove}
					onChange={(e) => onPromptToImproveChange(e.currentTarget.value)}
					minRows={6}
					autosize
					className={styles.promptToImproveTextarea}
				/>
			)}

			{/* User Instructions Input */}
			<Textarea
				label={label}
				description={description}
				placeholder={placeholder}
				value={userInstructions}
				onChange={(e) => onUserInstructionsChange(e.currentTarget.value)}
				minRows={3}
				autosize
				leftSection={<IconWritingSign size={14} />}
				error={error}
			/>

			<Group justify='flex-end' gap='xs'>
				<Button
					variant='subtle'
					size='sm'
					onClick={onCancel}
					disabled={isPending}
				>
					Cancel
				</Button>
				<Button
					variant='filled'
					size='sm'
					leftSection={<IconSparkles size={14} />}
					onClick={onGenerate}
					loading={isPending}
				>
					Generate
				</Button>
			</Group>
		</Stack>
	);
};

export default ComposeStep;
