import React, { useCallback, useState } from 'react';
import { Stack, Group, Button, Tooltip, Modal, Textarea } from '@mantine/core';
import {
	IconWand,
	IconSparkles,
	IconWritingSign,
	IconWandOff,
} from '@tabler/icons-react';
import { useGenerateCampaignPrompt } from '~/queries/campaignPromptQueries';
import styles from './PromptAiActions.module.css';
import { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';

type PromptAiActionsProps = {
	prompt?: string;
	onApply: (content: string) => void;
	campaignId?: number;
	type: CampaignPromptTypeModel;
};

const PromptAiActions: React.FC<PromptAiActionsProps> = ({
	prompt,
	onApply,
	type,
}) => {
	const [editorOpen, setEditorOpen] = useState(false);
	const [promptContent, setPromptContent] = useState('');
	const [mode, setMode] = useState<'improve' | 'create' | null>(null);
	const [error, setError] = useState<string | undefined>();
	const { mutateAsync, isPending } = useGenerateCampaignPrompt();

	const getBasePrompt = useCallback(
		(targetMode: 'improve' | 'create') => {
			if (targetMode === 'improve') {
				return `You enhance a "${type.name}" section composed of behavioral or instructional directives for an AI agent.
Your task is to rewrite the provided text into clearer, stronger, and more actionable directives while preserving its original intent.

Language rules:
- Detect and keep the same language used in the input.
- Do not translate, switch languages, or add multilingual content.

Content rules:
- Output ONLY agent-behavior instructions using direct persona/imperative voice, consistent with the input (e.g., “Actúas…”, “You maintain…”, etc.).
- Preserve the meaning and tone.
- Improve clarity, precision, and professionalism.
- Do NOT add new concepts beyond what the user wrote.
- Do NOT narrate, explain, or describe; only output the improved directives.
- Format as Markdown bullet points.

This is the prompt to improve:
${prompt || ''}`;
			}

			return `You generate a brand new "${type.name}" section for an AI agent using only the user-provided instructions.

Language rules:
- Detect and maintain the language used in the input.
- Do not translate, switch languages, or add multilingual content.

Content rules:
- Convert the user’s guidance into clear, actionable directives consistent with the purpose of the "${type.name}" section.
- Use a direct persona/imperative style aligned with the input (e.g., “Actúas…”, “Mantienes…”, “You act…”, “You remain…”, etc.).
- Use ONLY the concepts explicitly provided by the user.
- Do NOT add any extra ideas, traits, or context beyond the user input.
- Do NOT narrate, explain, or justify; only output the actionable directives.
- Format as Markdown bullet points.`;
		},
		[prompt]
	);

	const openEditor = useCallback(
		(nextMode: 'improve' | 'create') => {
			const base = getBasePrompt(nextMode);
			setMode(nextMode);
			setPromptContent(base);
			setError(undefined);
			setEditorOpen(true);
		},
		[getBasePrompt]
	);

	const handleGenerate = async () => {
		if (!promptContent.trim()) {
			setError('Add guidance before sending the request.');
			return;
		}

		setError(undefined);

		try {
			const result = await mutateAsync({
				prompt: promptContent.trim(),
			});

			if (result?.content) {
				onApply(result.content);
				setEditorOpen(false);
			}
		} catch {
			// Error already logged in query mutation
		}
	};

	const modalTitle =
		mode === 'improve'
			? 'Improve prompt with AI'
			: mode === 'create'
				? 'Create prompt with AI'
				: 'Review AI prompt';

	return (
		<Stack gap='xs' className={styles.wrapper}>
			<Group gap='xs' justify='flex-end'>
				<Tooltip
					label='Refine the existing prompt with your guidance.'
					withArrow
				>
					<Button
						variant='outline'
						size='xs'
						leftSection={<IconWand size={14} />}
						onClick={() => openEditor('improve')}
					>
						Improve with AI
					</Button>
				</Tooltip>
				<Tooltip
					label='Start a new prompt from scratch with AI help.'
					withArrow
				>
					<Button
						variant='filled'
						size='xs'
						leftSection={<IconSparkles size={14} />}
						rightSection={<IconWandOff size={14} />}
						onClick={() => openEditor('create')}
					>
						Create prompt with AI
					</Button>
				</Tooltip>
			</Group>

			<Modal
				opened={editorOpen}
				onClose={() => setEditorOpen(false)}
				title={modalTitle}
				size='lg'
				centered
			>
				<Stack gap='xs'>
					<Textarea
						label='Prompt to send'
						placeholder='Add context, constraints, or the desired tone before sending.'
						value={promptContent}
						onChange={(event) => setPromptContent(event.currentTarget.value)}
						minRows={6}
						autosize
						leftSection={<IconWritingSign size={14} />}
						error={error}
					/>
					<Group justify='flex-end' gap='xs'>
						<Button
							variant='outline'
							size='xs'
							onClick={() => setEditorOpen(false)}
							disabled={isPending}
						>
							Cancel
						</Button>
						<Button
							variant='filled'
							size='xs'
							leftSection={<IconSparkles size={14} />}
							onClick={handleGenerate}
							loading={isPending}
						>
							Send to AI
						</Button>
					</Group>
				</Stack>
			</Modal>
		</Stack>
	);
};

export default PromptAiActions;
