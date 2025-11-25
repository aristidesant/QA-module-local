import React from 'react';
import { Stack, Group, Button, Tooltip, Modal } from '@mantine/core';
import { IconSparkles, IconWand } from '@tabler/icons-react';
import 'react-diff-view/style/index.css';
import { usePromptAiActions } from './usePromptAiActions';
import ComposeStep from './ComposeStep';
import ReviewStep from './ReviewStep';
import styles from './PromptAiActions.module.css';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';

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
	const {
		// State
		editorOpen,
		step,
		mode,
		systemPromptExpanded,
		systemPromptEditing,
		systemPromptContent,
		promptToImprove,
		userInstructions,
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
	} = usePromptAiActions({
		prompt,
		typeName: type.name,
		onApply,
	});

	return (
		<Stack gap='xs' className={styles.wrapper}>
			<Group gap='xs' justify='flex-end'>
				<Tooltip label={buttonTooltip} withArrow>
					<Button
						variant={hasContent ? 'outline' : 'filled'}
						size='xs'
						leftSection={
							hasContent ? <IconWand size={14} /> : <IconSparkles size={14} />
						}
						onClick={openEditor}
					>
						{buttonLabel}
					</Button>
				</Tooltip>
			</Group>

			<Modal
				opened={editorOpen}
				onClose={handleCloseModal}
				title={modalTitle}
				size='80%'
				centered
			>
				{step === 'compose' ? (
					<ComposeStep
						mode={mode}
						systemPromptExpanded={systemPromptExpanded}
						systemPromptEditing={systemPromptEditing}
						systemPromptContent={systemPromptContent}
						promptToImprove={promptToImprove}
						userInstructions={userInstructions}
						error={error}
						isPending={isPending}
						onSystemPromptExpandToggle={() =>
							setSystemPromptExpanded(!systemPromptExpanded)
						}
						onSystemPromptEditStart={() => setSystemPromptEditing(true)}
						onSystemPromptEditEnd={() => setSystemPromptEditing(false)}
						onSystemPromptReset={resetSystemPrompt}
						onSystemPromptChange={setSystemPromptContent}
						onPromptToImproveChange={setPromptToImprove}
						onUserInstructionsChange={setUserInstructions}
						onGenerate={handleGenerate}
						onCancel={handleCloseModal}
					/>
				) : (
					<ReviewStep
						diffData={diffData}
						onApply={handleApplyChanges}
						onReject={handleReject}
						onCancel={handleCloseModal}
					/>
				)}
			</Modal>
		</Stack>
	);
};

export default PromptAiActions;
