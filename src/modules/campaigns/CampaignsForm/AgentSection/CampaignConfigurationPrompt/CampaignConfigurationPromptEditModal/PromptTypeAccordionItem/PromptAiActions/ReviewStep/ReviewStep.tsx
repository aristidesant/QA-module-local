import React from 'react';
import {
	Stack,
	Group,
	Button,
	Box,
	ScrollArea,
	Alert,
	Text,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { Diff } from 'react-diff-view';
import 'react-diff-view/style/index.css';
import type { DiffResult } from '../diffUtils';
import styles from '../PromptAiActions.module.css';
import { useTranslation } from 'react-i18next';

type ReviewStepProps = {
	diffData: DiffResult | null;
	onApply: () => void;
	onCancel: () => void;
};

const ReviewStep: React.FC<ReviewStepProps> = ({
	diffData,
	onApply,
	onCancel,
}) => {
	const { t } = useTranslation('campaigns');

	const renderDiffContent = () => {
		if (!diffData) {
			return null;
		}

		if (diffData.error) {
			return (
				<Alert
					color='red'
					title={t('form.agent.prompt.editor.ai.modal.review.error.title')}
				>
					{t('form.agent.prompt.editor.ai.modal.review.error.description')}
				</Alert>
			);
		}

		if (!diffData.hasChanges) {
			return (
				<Alert
					color='blue'
					title={t('form.agent.prompt.editor.ai.modal.review.noChanges.title')}
				>
					{t('form.agent.prompt.editor.ai.modal.review.noChanges.description')}
				</Alert>
			);
		}

		if (diffData.files.length === 0) {
			return null;
		}

		return (
			<Box className={styles.diffContainer}>
				<Box className={styles.versionLabels}>
					<Text
						className={`${styles.versionLabel} ${styles.versionLabelOriginal}`}
					>
						{t('form.agent.prompt.editor.ai.modal.review.diff.old')}
					</Text>
					<Text
						className={`${styles.versionLabel} ${styles.versionLabelImproved}`}
					>
						{t('form.agent.prompt.editor.ai.modal.review.diff.new')}
					</Text>
				</Box>
				<ScrollArea.Autosize mah='60vh'>
					<Box className={styles.diffWrapper}>
						<Diff
							viewType='split'
							diffType={diffData.files[0].type}
							hunks={diffData.files[0].hunks}
						/>
					</Box>
				</ScrollArea.Autosize>
			</Box>
		);
	};

	return (
		<Stack gap='md'>
			{renderDiffContent()}

			<Group justify='end' gap='xs'>
				<Group gap='xs'>
					<Button variant='subtle' size='sm' onClick={onCancel}>
						{t('form.agent.prompt.editor.ai.modal.review.actions.back')}
					</Button>
					<Button
						variant='filled'
						size='sm'
						leftSection={<IconCheck size={14} />}
						onClick={onApply}
					>
						{t('form.agent.prompt.editor.ai.modal.review.actions.apply')}
					</Button>
				</Group>
			</Group>
		</Stack>
	);
};

export default ReviewStep;
