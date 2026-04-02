import { useEffect, useMemo, useState } from 'react';
import {
	Alert,
	Badge,
	Button,
	Group,
	Modal,
	ScrollArea,
	Stack,
	Text,
	Textarea,
} from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { AgentVersionSnapshot } from '~/models/AgentVersioningModel';
import type { SplitDiffLine } from '../VersioningSection/VersioningSection.helpers';
import {
	buildDisplayDiffRows,
	buildSplitDiffRows,
	stringifySnapshot,
} from '../VersioningSection/VersioningSection.helpers';
import classes from './AgentSaveReviewModal.module.css';

interface AgentSaveReviewModalProps {
	opened: boolean;
	onClose: () => void;
	publishedSnapshot?: AgentVersionSnapshot | null;
	currentSnapshot?: AgentVersionSnapshot | null;
	onPublish: (versionDescription: string) => void;
	isPublishing: boolean;
	warningMessage?: string;
}

const renderLine = (line: SplitDiffLine) => (
	<pre className={classes.lineContent}>
		{line.wordSegments
			? line.wordSegments.map((seg, i) =>
					seg.changed ? (
						<mark key={i} className={classes.wordHighlight}>
							{seg.text}
						</mark>
					) : (
						seg.text
					)
				)
			: line.text}
	</pre>
);

const AgentSaveReviewModal = ({
	opened,
	onClose,
	publishedSnapshot,
	currentSnapshot,
	onPublish,
	isPublishing,
	warningMessage,
}: AgentSaveReviewModalProps) => {
	const { t } = useTranslation('campaign.form.agents');
	const [description, setDescription] = useState('');
	const [expandedSeparators, setExpandedSeparators] = useState<Set<number>>(
		new Set()
	);

	useEffect(() => {
		if (opened) {
			setDescription('');
			setExpandedSeparators(new Set());
		}
	}, [opened]);

	const allRows = useMemo(() => {
		if (!publishedSnapshot || !currentSnapshot) return [];
		return buildSplitDiffRows(publishedSnapshot, currentSnapshot);
	}, [publishedSnapshot, currentSnapshot]);

	const baseDisplayRows = useMemo(
		() => buildDisplayDiffRows(allRows),
		[allRows]
	);

	const hasChanges =
		stringifySnapshot(publishedSnapshot) !== stringifySnapshot(currentSnapshot);

	const toggleExpand = (index: number) => {
		setExpandedSeparators((prev) => {
			const next = new Set(prev);
			if (next.has(index)) {
				next.delete(index);
			} else {
				next.add(index);
			}
			return next;
		});
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('saveReview.title')}
			size='90%'
			centered
			padding='lg'
		>
			<Stack gap='md'>
				<div className={classes.diffShell}>
					<ScrollArea className={classes.diffScroll}>
						{hasChanges ? (
							<div className={classes.splitDiff}>
								<div className={classes.diffHeaderRow}>
									<div className={classes.diffHeaderCell}>
										<Text size='sm' c='dimmed'>
											{t('saveReview.publishedLabel')}
										</Text>
										<Badge variant='outline' color='gray' size='sm' radius='sm'>
											Main
										</Badge>
									</div>
									<div className={classes.diffHeaderCell}>
										<Text size='sm' c='dimmed'>
											{t('saveReview.currentLabel')}
										</Text>
										<Badge variant='outline' color='gray' size='sm' radius='sm'>
											Main
										</Badge>
									</div>
								</div>
								{baseDisplayRows.flatMap((row, index) => {
									if (row.type === 'separator') {
										if (expandedSeparators.has(index)) {
											return allRows
												.slice(row.rowRange.start, row.rowRange.end + 1)
												.map((expandedRow, j) => (
													<div
														key={`exp-${index}-${j}`}
														className={classes.diffRow}
													>
														<div className={classes.diffCell}>
															{renderLine(expandedRow.left)}
														</div>
														<div className={classes.diffCell}>
															{renderLine(expandedRow.right)}
														</div>
													</div>
												));
										}
										return [
											<div
												key={`sep-${index}`}
												className={classes.separatorRow}
											>
												<button
													type='button'
													className={classes.expandLink}
													onClick={() => toggleExpand(index)}
												>
													{t('saveReview.hiddenLines', {
														count: row.hiddenLineCount,
													})}
												</button>
											</div>,
										];
									}
									return [
										<div key={`row-${index}`} className={classes.diffRow}>
											<div
												className={[
													classes.diffCell,
													row.left.kind === 'removed'
														? classes.removedCell
														: row.left.kind === 'empty'
															? classes.emptyCell
															: '',
												]
													.filter(Boolean)
													.join(' ')}
											>
												{renderLine(row.left)}
											</div>
											<div
												className={[
													classes.diffCell,
													row.right.kind === 'added'
														? classes.addedCell
														: row.right.kind === 'empty'
															? classes.emptyCell
															: '',
												]
													.filter(Boolean)
													.join(' ')}
											>
												{renderLine(row.right)}
											</div>
										</div>,
									];
								})}
							</div>
						) : (
							<div className={classes.emptyDiff}>
								<Text size='sm' c='dimmed'>
									{t('saveReview.noChanges')}
								</Text>
							</div>
						)}
					</ScrollArea>
				</div>

				{warningMessage && (
					<Alert
						icon={<IconAlertTriangle size={16} />}
						color='orange'
						variant='light'
						p='sm'
					>
						<Text size='sm'>{warningMessage}</Text>
					</Alert>
				)}

				<Stack gap='xs'>
					<Text size='sm' fw={500}>
						{t('saveReview.descriptionLabel')}
					</Text>
					<Textarea
						placeholder={t('saveReview.descriptionPlaceholder')}
						value={description}
						onChange={(e) => setDescription(e.currentTarget.value)}
						autosize
						minRows={2}
						maxRows={4}
					/>
				</Stack>

				<Group justify='space-between'>
					<Button variant='default' onClick={onClose} disabled={isPublishing}>
						{t('saveReview.cancel')}
					</Button>
					<Button onClick={() => onPublish(description)} loading={isPublishing}>
						{t('saveReview.confirm')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
};

export default AgentSaveReviewModal;
