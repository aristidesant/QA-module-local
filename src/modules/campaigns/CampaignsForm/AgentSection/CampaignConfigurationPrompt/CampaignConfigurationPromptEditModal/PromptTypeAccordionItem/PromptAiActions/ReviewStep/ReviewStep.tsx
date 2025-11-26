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
	const renderDiffContent = () => {
		if (!diffData) {
			return null;
		}

		if (diffData.error) {
			return (
				<Alert color='red' title='Error'>
					Failed to generate diff view.
				</Alert>
			);
		}

		if (!diffData.hasChanges) {
			return (
				<Alert color='blue' title='No Changes'>
					The AI suggestion is identical to your current prompt.
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
						Current version
					</Text>
					<Text
						className={`${styles.versionLabel} ${styles.versionLabelImproved}`}
					>
						AI suggestion
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
						Cancel
					</Button>
					<Button
						variant='filled'
						size='sm'
						leftSection={<IconCheck size={14} />}
						onClick={onApply}
					>
						Apply changes
					</Button>
				</Group>
			</Group>
		</Stack>
	);
};

export default ReviewStep;
