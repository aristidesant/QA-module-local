import {
	Alert,
	Button,
	Group,
	Loader,
	Modal,
	ScrollArea,
	Stack,
	Text,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type {
	AgentVersionSnapshot,
	AgentVersionSummary,
} from '~/models/AgentVersioningModel';
import {
	buildDisplayDiffRows,
	formatCommittedAt,
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

	const diffRows = useMemo(() => {
		if (!currentSnapshot || !selectedSnapshot || !selectedVersion) {
			return [];
		}

		return buildDisplayDiffRows(currentSnapshot, selectedSnapshot);
	}, [currentSnapshot, selectedSnapshot, selectedVersion]);

	const hasChanges =
		stringifySnapshot(currentSnapshot) !== stringifySnapshot(selectedSnapshot);

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('diff.title')}
			size='90%'
			centered
		>
			<Stack gap='sm'>
				{selectedVersion ? (
					<div className={classes.metaGrid}>
						<div className={classes.metaCard}>
							<Text size='xs' c='dimmed'>
								{t('diff.selectedVersion')}
							</Text>
							<Text size='sm' fw={600}>
								{t('history.versionBadge', {
									version: selectedVersion.seqNoInBranch,
								})}
							</Text>
							<Text size='xs' c='dimmed'>
								{formatCommittedAt(selectedVersion.timeCommittedSecs)}
							</Text>
						</div>
						<div className={classes.metaCard}>
							<Text size='xs' c='dimmed'>
								{t('diff.createdBy')}
							</Text>
							<Text size='sm' fw={600}>
								{selectedVersion.accessInfo?.creatorName ||
									t('history.unknownAuthor')}
							</Text>
							<Text size='xs' c='dimmed'>
								{selectedVersion.accessInfo?.creatorEmail || '—'}
							</Text>
						</div>
					</div>
				) : null}

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
											<Text size='xs' c='dimmed' fw={600}>
												{t('diff.currentLabel')}
											</Text>
										</div>
										<div className={classes.diffHeaderCell}>
											<Text size='xs' c='dimmed' fw={600}>
												{t('diff.selectedLabel', {
													version: selectedVersion?.seqNoInBranch,
												})}
											</Text>
										</div>
									</div>
									{diffRows.map((row, index) =>
										row.type === 'separator' ? (
											<div
												className={classes.separatorRow}
												key={`diff-gap-${index}`}
											>
												<Text size='xs' c='dimmed'>
													{t('diff.hiddenLines', {
														count: row.hiddenLineCount,
													})}
												</Text>
											</div>
										) : (
											<div
												className={classes.diffRow}
												key={`diff-row-${index}`}
											>
												<div
													className={[
														classes.diffCell,
														row.left.kind === 'removed'
															? classes.removedCell
															: row.left.kind === 'context'
																? classes.contextCell
																: classes.emptyCell,
													].join(' ')}
												>
													<span className={classes.lineMarker}>
														{row.left.kind === 'removed'
															? '-'
															: row.left.kind === 'context'
																? ' '
																: ''}
													</span>
													<span className={classes.lineNumber}>
														{row.left.lineNumber ?? ''}
													</span>
													<pre className={classes.lineContent}>
														{row.left.text}
													</pre>
												</div>
												<div
													className={[
														classes.diffCell,
														row.right.kind === 'added'
															? classes.addedCell
															: row.right.kind === 'context'
																? classes.contextCell
																: classes.emptyCell,
													].join(' ')}
												>
													<span className={classes.lineMarker}>
														{row.right.kind === 'added'
															? '+'
															: row.right.kind === 'context'
																? ' '
																: ''}
													</span>
													<span className={classes.lineNumber}>
														{row.right.lineNumber ?? ''}
													</span>
													<pre className={classes.lineContent}>
														{row.right.text}
													</pre>
												</div>
											</div>
										)
									)}
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
					<Text size='xs' c='dimmed'>
						{t('diff.footerHint')}
					</Text>
					<Group gap='xs'>
						<Button variant='default' onClick={onClose}>
							{t('actions.close')}
						</Button>
						<Button
							color='orange'
							onClick={onRevert}
							loading={isReverting}
							disabled={!selectedVersion}
						>
							{t('actions.revertVersion')}
						</Button>
					</Group>
				</Group>
			</Stack>
		</Modal>
	);
};

export default VersionDiffModal;
