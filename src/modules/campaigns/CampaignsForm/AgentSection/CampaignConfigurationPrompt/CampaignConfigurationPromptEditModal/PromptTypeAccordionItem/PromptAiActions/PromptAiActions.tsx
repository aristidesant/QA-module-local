import React from 'react';
import { Group, Button, Tooltip, Modal, Text } from '@mantine/core';
import { IconInfoCircle, IconSparkles, IconWand } from '@tabler/icons-react';
import 'react-diff-view/style/index.css';
import { usePromptAiActions } from './usePromptAiActions';
import ComposeStep from './ComposeStep';
import ReviewStep from './ReviewStep';
import styles from './PromptAiActions.module.css';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';
import { useTranslation } from 'react-i18next';

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
	const { t } = useTranslation('campaigns');
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
		<Group gap='xs' justify='space-between' className={styles.wrapper}>
			<Group gap='xs' className={styles.infoMessage}>
				<IconInfoCircle size={16} />
				<Text size='xs'>{t('form.agent.prompt.editor.variables.hint')}</Text>
			</Group>
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
						onCancel={handleReject}
					/>
				)}
			</Modal>
		</Group>
	);
};

export default PromptAiActions;
