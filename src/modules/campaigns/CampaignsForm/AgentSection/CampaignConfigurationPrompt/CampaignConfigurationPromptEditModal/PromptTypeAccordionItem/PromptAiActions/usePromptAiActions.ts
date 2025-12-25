import { useCallback, useMemo, useState } from 'react';
import { useGenerateCampaignPrompt } from '~/queries/campaignPromptQueries';
import { generateDiffData, type DiffResult } from './diffUtils';
import { type ModalStep, type PromptMode, SYSTEM_PROMPTS } from './constants';
import { useTranslation } from 'react-i18next';

type UsePromptAiActionsParams = {
	prompt?: string;
	typeName: string;
	onApply: (content: string) => void;
};

type UsePromptAiActionsReturn = {
	// State
	editorOpen: boolean;
	step: ModalStep;
	mode: PromptMode | null;
	systemPromptExpanded: boolean;
	systemPromptEditing: boolean;
	systemPromptContent: string;
	promptToImprove: string;
	userInstructions: string;
	generatedContent: string | null;
	error: string | undefined;
	isPending: boolean;

	// Computed
	hasContent: boolean;
	diffData: DiffResult | null;
	modalTitle: string;
	buttonLabel: string;
	buttonTooltip: string;

	// Actions
	openEditor: () => void;
	handleCloseModal: () => void;
	handleGenerate: () => Promise<void>;
	handleApplyChanges: () => void;
	handleReject: () => void;
	setSystemPromptExpanded: (expanded: boolean) => void;
	setSystemPromptEditing: (editing: boolean) => void;
	setSystemPromptContent: (content: string) => void;
	setPromptToImprove: (prompt: string) => void;
	setUserInstructions: (instructions: string) => void;
	resetSystemPrompt: () => void;
};

export const usePromptAiActions = ({
	prompt,
	typeName,
	onApply,
}: UsePromptAiActionsParams): UsePromptAiActionsReturn => {
	const { t } = useTranslation('campaigns');
	const [editorOpen, setEditorOpen] = useState(false);
	const [step, setStep] = useState<ModalStep>('compose');
	const [systemPromptExpanded, setSystemPromptExpanded] = useState(false);
	const [systemPromptEditing, setSystemPromptEditing] = useState(false);
	const [systemPromptContent, setSystemPromptContent] = useState('');
	const [promptToImprove, setPromptToImprove] = useState('');
	const [userInstructions, setUserInstructions] = useState('');
	const [generatedContent, setGeneratedContent] = useState<string | null>(null);
	const [mode, setMode] = useState<PromptMode | null>(null);
	const [error, setError] = useState<string | undefined>();

	const { mutateAsync, isPending } = useGenerateCampaignPrompt();

	const hasContent = useMemo(() => (prompt?.trim().length ?? 0) > 0, [prompt]);

	const getBaseSystemPrompt = useCallback(
		(targetMode: PromptMode) => {
			return targetMode === 'improve'
				? SYSTEM_PROMPTS.improve(typeName)
				: SYSTEM_PROMPTS.create(typeName);
		},
		[typeName]
	);

	const diffData = useMemo(() => {
		if (!generatedContent || !promptToImprove || mode !== 'improve') {
			return null;
		}
		return generateDiffData(promptToImprove, generatedContent);
	}, [generatedContent, promptToImprove, mode]);

	const openEditor = useCallback(() => {
		const targetMode: PromptMode = hasContent ? 'improve' : 'create';
		const base = getBaseSystemPrompt(targetMode);
		setMode(targetMode);
		setSystemPromptContent(base);
		setPromptToImprove(prompt || '');
		setUserInstructions('');
		setGeneratedContent(null);
		setError(undefined);
		setStep('compose');
		setSystemPromptExpanded(false);
		setSystemPromptEditing(false);
		setEditorOpen(true);
	}, [hasContent, getBaseSystemPrompt, prompt]);

	const handleCloseModal = useCallback(() => {
		setEditorOpen(false);
		setGeneratedContent(null);
		setStep('compose');
	}, []);

	const handleGenerate = useCallback(async () => {
		let fullPrompt = systemPromptContent;

		if (mode === 'improve' && promptToImprove.trim()) {
			fullPrompt = `${systemPromptContent}\n${promptToImprove.trim()}`;
		}

		if (userInstructions.trim()) {
			fullPrompt = `${fullPrompt}\n\nUser instructions:\n${userInstructions.trim()}`;
		}

		if (!fullPrompt.trim()) {
			setError(t('form.agent.prompt.editor.ai.modal.errors.emptyPrompt'));
			return;
		}

		setError(undefined);

		try {
			const result = await mutateAsync({
				prompt: fullPrompt.trim(),
			});

			if (result?.content) {
				if (mode === 'improve') {
					setGeneratedContent(result.content);
					setStep('review');
				} else {
					onApply(result.content);
					handleCloseModal();
				}
			}
		} catch {
			// Error already logged in query mutation
		}
	}, [
		systemPromptContent,
		mode,
		promptToImprove,
		userInstructions,
		mutateAsync,
		onApply,
		handleCloseModal,
		t,
	]);

	const handleApplyChanges = useCallback(() => {
		if (generatedContent) {
			onApply(generatedContent);
			handleCloseModal();
		}
	}, [generatedContent, onApply, handleCloseModal]);

	const handleReject = useCallback(() => {
		setStep('compose');
		setGeneratedContent(null);
	}, []);

	const resetSystemPrompt = useCallback(() => {
		setSystemPromptEditing(false);
		setSystemPromptContent(getBaseSystemPrompt(mode || 'create'));
	}, [getBaseSystemPrompt, mode]);

	const modalTitle = useMemo(() => {
		if (step === 'review') {
			return t('form.agent.prompt.editor.ai.modal.title.review');
		}
		return mode === 'improve'
			? t('form.agent.prompt.editor.ai.modal.title.improve')
			: t('form.agent.prompt.editor.ai.modal.title.create');
	}, [mode, step, t]);

	const buttonLabel = hasContent
		? t('form.agent.prompt.editor.ai.button.improve')
		: t('form.agent.prompt.editor.ai.button.create');
	const buttonTooltip = hasContent
		? t('form.agent.prompt.editor.ai.button.tooltip.improve')
		: t('form.agent.prompt.editor.ai.button.tooltip.create');

	return {
		// State
		editorOpen,
		step,
		mode,
		systemPromptExpanded,
		systemPromptEditing,
		systemPromptContent,
		promptToImprove,
		userInstructions,
		generatedContent,
		error,
		isPending,

		// Computed
		hasContent,
		diffData,
		modalTitle,
		buttonLabel,
		buttonTooltip,

		// Actions
		openEditor,
		handleCloseModal,
		handleGenerate,
		handleApplyChanges,
		handleReject,
		setSystemPromptExpanded,
		setSystemPromptEditing,
		setSystemPromptContent,
		setPromptToImprove,
		setUserInstructions,
		resetSystemPrompt,
	};
};
