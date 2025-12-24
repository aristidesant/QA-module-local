import React, { useMemo } from 'react';
import { Text, Group, Button, ScrollArea, Alert, Box } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { Diff, parseDiff } from 'react-diff-view';
import { diffLines as computeDiffLines, Change } from 'diff';
import type { CampaignPromptHistoryItem } from '~/models/CampaignPromptHistoryModel';
import dayjs from 'dayjs';
import 'react-diff-view/style/index.css';
import styles from './PromptHistoryModal.module.css';

interface PromptHistoryModalProps {
	item: CampaignPromptHistoryItem;
	currentPromptText?: string;
	onRestore: (promptText: string) => void;
	onClose: () => void;
}

const PromptHistoryModal: React.FC<PromptHistoryModalProps> = ({
	item,
	currentPromptText,
	onRestore,
	onClose,
}) => {
	const { t } = useTranslation('campaigns');
	const diffData = useMemo(() => {
		if (!currentPromptText) {
			return null;
		}

		try {
			// Generate diff changes
			const changes: Change[] = computeDiffLines(
				item.promptText,
				currentPromptText
			);

			// Check if there are actual differences
			const hasChanges = changes.some(
				(change) => change.added || change.removed
			);

			if (!hasChanges) {
				return { hasChanges: false, files: [] };
			}

			// Convert changes to unified diff format manually
			const oldLines = item.promptText.split('\n');
			const newLines = currentPromptText.split('\n');

			const diffLinesArray: string[] = [];

			changes.forEach((change) => {
				const value = change.value || '';
				const lines = value.split('\n');
				// Remove last empty line if it exists
				if (lines[lines.length - 1] === '') {
					lines.pop();
				}

				lines.forEach((line) => {
					if (change.added) {
						diffLinesArray.push(`+${line}`);
					} else if (change.removed) {
						diffLinesArray.push(`-${line}`);
					} else {
						diffLinesArray.push(` ${line}`);
					}
				});
			});

			// Create unified diff format
			const diffText = `--- a/prompt
+++ b/prompt
@@ -1,${oldLines.length} +1,${newLines.length} @@
${diffLinesArray.join('\n')}`;

			// Parse the unified diff
			const files = parseDiff(diffText, { nearbySequences: 'zip' });

			return { hasChanges: true, files };
		} catch (error) {
			console.error('Error generating diff:', error);
			return { hasChanges: false, files: [], error: true };
		}
	}, [item.promptText, currentPromptText]);

	return (
		<Box className={styles.modalContent}>
			<Box className={styles.metadataBar}>
				<Group gap='xl'>
					<Box>
						<Text size='xs' c='dimmed' mb={4}>
							{t('promptHistory.modifiedBy')}
						</Text>
						<Text size='sm' fw={500}>
							{item.user.username}
						</Text>
					</Box>
					<Box>
						<Text size='xs' c='dimmed' mb={4}>
							{t('promptHistory.dateModified')}
						</Text>
						<Text size='sm' fw={500}>
							{dayjs(item.createdAt).format(t('promptHistory.dateFormat'))}
						</Text>
					</Box>
				</Group>
			</Box>

			<ScrollArea h='calc(100vh - 240px)' className={styles.scrollArea}>
				{!currentPromptText ? (
					<Box className={styles.textContainer}>
						<Text
							className={styles.textContent}
							style={{ whiteSpace: 'pre-wrap' }}
						>
							{item.promptText}
						</Text>
					</Box>
				) : diffData?.error ? (
					<Alert color='red' title='Error' radius='md'>
						{t('promptHistory.diffError')}
						<Box className={styles.textContainer} mt='md'>
							<Text
								className={styles.textContent}
								style={{ whiteSpace: 'pre-wrap' }}
							>
								{item.promptText}
							</Text>
						</Box>
					</Alert>
				) : !diffData?.hasChanges ? (
					<Alert color='blue' title={t('promptHistory.noChanges')} radius='md'>
						{t('promptHistory.noChangesDesc')}
					</Alert>
				) : diffData.files.length > 0 ? (
					<Box className={styles.diffContainer}>
						<Box className={styles.versionLabels}>
							<Text
								className={`${styles.versionLabel} ${styles.versionLabelPrevious}`}
							>
								{t('promptHistory.previousVersion', { version: item.version })}
							</Text>
							<Text
								className={`${styles.versionLabel} ${styles.versionLabelCurrent}`}
							>
								{t('promptHistory.currentVersion')}
							</Text>
						</Box>
						<Box className={styles.diffWrapper}>
							<Diff
								viewType='split'
								diffType={diffData.files[0].type}
								hunks={diffData.files[0].hunks}
							/>
						</Box>
					</Box>
				) : (
					<Box className={styles.textContainer}>
						<Text
							className={styles.textContent}
							style={{ whiteSpace: 'pre-wrap' }}
						>
							{item.promptText}
						</Text>
					</Box>
				)}
			</ScrollArea>

			<Box className={styles.actionsBar}>
				<Group justify='space-between'>
					<Button variant='subtle' color='gray' onClick={onClose} size='md'>
						{t('promptHistory.close')}
					</Button>
					<Button
						variant='filled'
						color='blue'
						onClick={() => onRestore(item.promptText)}
						size='md'
					>
						{t('promptHistory.restoreVersion')}
					</Button>
				</Group>
			</Box>
		</Box>
	);
};

export default PromptHistoryModal;
