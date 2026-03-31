import { useEffect, useMemo, useRef, useState } from 'react';
import {
	Alert,
	Button,
	Group,
	Modal,
	Stack,
	Text,
	Textarea,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import type { AgentWorkflow } from '~/models/AgentWorkflowModel';
import {
	parseImportedWorkflow,
	type WorkflowImportErrorCode,
	type WorkflowImportResult,
	WorkflowImportError,
} from '../utils/workflowClipboard';
import styles from './WorkflowImportModal.module.css';

interface WorkflowImportModalProps {
	opened: boolean;
	onClose: () => void;
	onReplace: (workflow: AgentWorkflow) => void;
	fallbackPreventSubagentLoops: boolean;
	autoReadClipboardRequestKey: number;
}

type ClipboardLoadStatus = 'idle' | 'loading' | 'loaded' | 'empty' | 'failed';

const WorkflowImportModal = ({
	opened,
	onClose,
	onReplace,
	fallbackPreventSubagentLoops,
	autoReadClipboardRequestKey,
}: WorkflowImportModalProps) => {
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
	const [rawValue, setRawValue] = useState('');
	const [clipboardLoadStatus, setClipboardLoadStatus] =
		useState<ClipboardLoadStatus>('idle');
	const pastedValueRef = useRef(false);
	const userEditedDuringOpenRef = useRef(false);
	const latestClipboardReadRequestRef = useRef(0);

	const importState = useMemo(() => {
		const trimmedValue = rawValue.trim();

		if (!trimmedValue) {
			return {
				errorCode: null as WorkflowImportErrorCode | null,
				result: null as WorkflowImportResult | null,
			};
		}

		try {
			return {
				errorCode: null as WorkflowImportErrorCode | null,
				result: parseImportedWorkflow(
					trimmedValue,
					fallbackPreventSubagentLoops
				),
			};
		} catch (error) {
			if (error instanceof WorkflowImportError) {
				return {
					errorCode: error.code,
					result: null as WorkflowImportResult | null,
				};
			}

			return {
				errorCode: 'invalidRoot' as WorkflowImportErrorCode,
				result: null as WorkflowImportResult | null,
			};
		}
	}, [fallbackPreventSubagentLoops, rawValue]);

	useEffect(() => {
		if (opened) {
			return;
		}

		setRawValue('');
		setClipboardLoadStatus('idle');
		pastedValueRef.current = false;
		userEditedDuringOpenRef.current = false;
	}, [opened]);

	useEffect(() => {
		if (!opened || autoReadClipboardRequestKey === 0) {
			return;
		}

		let isCancelled = false;

		latestClipboardReadRequestRef.current = autoReadClipboardRequestKey;
		userEditedDuringOpenRef.current = false;
		setClipboardLoadStatus('loading');

		if (
			typeof navigator === 'undefined' ||
			!navigator.clipboard ||
			typeof navigator.clipboard.readText !== 'function'
		) {
			setClipboardLoadStatus('failed');
			return;
		}

		void navigator.clipboard
			.readText()
			.then((clipboardText) => {
				if (
					isCancelled ||
					latestClipboardReadRequestRef.current !== autoReadClipboardRequestKey
				) {
					return;
				}

				if (userEditedDuringOpenRef.current) {
					setClipboardLoadStatus('idle');
					return;
				}

				if (!clipboardText.trim()) {
					setClipboardLoadStatus('empty');
					return;
				}

				setRawValue(clipboardText);
				setClipboardLoadStatus('loaded');
			})
			.catch(() => {
				if (
					isCancelled ||
					latestClipboardReadRequestRef.current !== autoReadClipboardRequestKey
				) {
					return;
				}

				if (userEditedDuringOpenRef.current) {
					setClipboardLoadStatus('idle');
					return;
				}

				setClipboardLoadStatus('failed');
			});

		return () => {
			isCancelled = true;
		};
	}, [autoReadClipboardRequestKey, opened]);

	useEffect(() => {
		if (importState.result) {
			pastedValueRef.current = false;
		}
	}, [importState.result]);

	useEffect(() => {
		if (!opened || !pastedValueRef.current || !importState.errorCode) {
			return;
		}

		pastedValueRef.current = false;
		notifications.show({
			color: 'red',
			title: t('form.workflow.clipboard.notifications.invalidImportTitle'),
			message: t(`form.workflow.clipboard.errors.${importState.errorCode}`, {
				defaultValue: t('form.workflow.clipboard.errors.invalidRoot'),
			}),
		});
	}, [importState.errorCode, opened, t]);

	const handleReplace = () => {
		if (!importState.result) {
			return;
		}

		onReplace(importState.result.workflow);
	};

	const handleInputChange = (value: string) => {
		userEditedDuringOpenRef.current = true;
		setClipboardLoadStatus('idle');
		setRawValue(value);
	};

	const clipboardStatusMessage =
		clipboardLoadStatus === 'loading'
			? t('form.workflow.clipboard.import.clipboard.loading')
			: clipboardLoadStatus === 'loaded'
				? t('form.workflow.clipboard.import.clipboard.loaded')
				: clipboardLoadStatus === 'empty'
					? t('form.workflow.clipboard.import.clipboard.empty')
					: clipboardLoadStatus === 'failed'
						? t('form.workflow.clipboard.import.clipboard.failed')
						: null;

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('form.workflow.clipboard.import.title')}
			size='lg'
			centered
		>
			<Stack gap='sm' className={styles.content}>
				<Text size='sm' className={styles.helperText}>
					{t('form.workflow.clipboard.import.description')}
				</Text>
				{clipboardStatusMessage ? (
					<Alert
						color={
							clipboardLoadStatus === 'failed'
								? 'yellow'
								: clipboardLoadStatus === 'loaded'
									? 'teal'
									: 'gray'
						}
						variant='light'
					>
						{clipboardStatusMessage}
					</Alert>
				) : null}
				<Textarea
					label={t('form.workflow.clipboard.import.inputLabel')}
					placeholder={t('form.workflow.clipboard.import.placeholder')}
					value={rawValue}
					onChange={(event) => handleInputChange(event.currentTarget.value)}
					onPaste={() => {
						pastedValueRef.current = true;
					}}
					autosize
					minRows={14}
					maxRows={22}
					classNames={{ input: styles.input }}
					aria-busy={clipboardLoadStatus === 'loading'}
				/>
				{importState.errorCode ? (
					<Alert color='red' variant='light'>
						{t(`form.workflow.clipboard.errors.${importState.errorCode}`, {
							defaultValue: t('form.workflow.clipboard.errors.invalidRoot'),
						})}
					</Alert>
				) : null}
				{importState.result ? (
					<div className={styles.summaryCard}>
						<Stack gap={6}>
							<Text size='sm' fw={600} className={styles.summaryValue}>
								{t('form.workflow.clipboard.import.summaryTitle')}
							</Text>
							<Group gap='md'>
								<Text size='sm'>
									{t('form.workflow.clipboard.import.summaryNodes', {
										count: importState.result.summary.nodeCount,
									})}
								</Text>
								<Text size='sm'>
									{t('form.workflow.clipboard.import.summaryEdges', {
										count: importState.result.summary.edgeCount,
									})}
								</Text>
								<Text size='sm'>
									{importState.result.summary.preventSubagentLoops
										? t(
												'form.workflow.clipboard.import.summaryPreventLoopsEnabled'
											)
										: t(
												'form.workflow.clipboard.import.summaryPreventLoopsDisabled'
											)}
								</Text>
							</Group>
						</Stack>
					</div>
				) : null}
				<div className={styles.footer}>
					<Button variant='default' onClick={onClose}>
						{t('common:actions.cancel')}
					</Button>
					<Button onClick={handleReplace} disabled={!importState.result}>
						{t('form.workflow.clipboard.import.replace')}
					</Button>
				</div>
			</Stack>
		</Modal>
	);
};

export default WorkflowImportModal;
