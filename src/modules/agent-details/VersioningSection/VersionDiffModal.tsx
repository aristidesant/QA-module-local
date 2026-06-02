import {
	Alert,
	Badge,
	Button,
	Group,
	Loader,
	Modal,
	ScrollArea,
	Text,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
	AgentVersionSnapshot,
	AgentVersionSummary,
} from '~/models/AgentVersioningModel';
import type { SplitDiffLine } from './VersioningSection.helpers';
import {
	buildDisplayDiffRows,
	buildSplitDiffRows,
	stringifySnapshot,
} from './VersioningSection.helpers';
import classes from './VersionDiffModal.module.css';

interface VersionDiffModalProps {
	opened: boolean;
	onClose: () => void;
	currentSnapshot?: AgentVersionSnapshot;
	selectedSnapshot?: AgentVersionSnapshot;
	selectedVersion?: AgentVersionSummary | null;
	isLoading: boolean;
	isReverting: boolean;
	onRevert: () => void;
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

const VersionDiffModal = ({
	opened,
	onClose,
	currentSnapshot,
	selectedSnapshot,
	selectedVersion,
	isLoading,
	isReverting,
	onRevert,
}: VersionDiffModalProps) => {
	const { t } = useTranslation('campaign.form.versioning');
	const [expandedSeparators, setExpandedSeparators] = useState<Set<number>>(
		new Set()
	);

	useEffect(() => {
		setExpandedSeparators(new Set());
	}, [selectedVersion?.id]);

	const allRows = useMemo(() => {
		if (!currentSnapshot || !selectedSnapshot) return [];
		return buildSplitDiffRows(currentSnapshot, selectedSnapshot);
	}, [currentSnapshot, selectedSnapshot]);

	const baseDisplayRows = useMemo(
		() => buildDisplayDiffRows(allRows),
		[allRows]
	);

	const hasChanges =
		stringifySnapshot(currentSnapshot) !== stringifySnapshot(selectedSnapshot);

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
			title={
				selectedVersion
					? `${t('diff.title')} - v${selectedVersion.seqNoInBranch}`
					: t('diff.title')
			}
			size='90%'
			centered
			padding='lg'
		>
			<div className={classes.modalBody}>
				{isLoading ? (
					<Group justify='center' py='xl'>
						<Loader size='sm' />
					</Group>
				) : !selectedSnapshot || !currentSnapshot ? (
					<Alert
						icon={<IconAlertCircle size={16} />}
						color='yellow'
						variant='light'
					>
						{t('diff.snapshotUnavailable')}
					</Alert>
				) : (
					<div className={classes.diffShell}>
						<ScrollArea className={classes.diffScroll}>
							{hasChanges ? (
								<div className={classes.splitDiff}>
									<div className={classes.diffHeaderRow}>
										<div className={classes.diffHeaderCell}>
											<Text size='sm' c='dimmed'>
												{t('diff.currentLabel')}
											</Text>
											<Badge
												variant='outline'
												color='gray'
												size='sm'
												radius='sm'
											>
												Main
											</Badge>
										</div>
										<div className={classes.diffHeaderCell}>
											<Text size='sm' c='dimmed'>
												{t('diff.selectedLabel')}
											</Text>
											<Badge
												variant='outline'
												color='gray'
												size='sm'
												radius='sm'
											>
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
														{t('diff.hiddenLines', {
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
										{t('diff.noChanges')}
									</Text>
								</div>
							)}
						</ScrollArea>
					</div>
				)}

				<Group justify='space-between'>
					<Button variant='default' onClick={onClose}>
						{t('actions.close')}
					</Button>
					<Button
						color='blue'
						onClick={onRevert}
						loading={isReverting}
						disabled={!selectedVersion}
					>
						{t('actions.revertVersion')}
					</Button>
				</Group>
			</div>
		</Modal>
	);
};

export default VersionDiffModal;
