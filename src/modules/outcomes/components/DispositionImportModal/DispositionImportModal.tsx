import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import {
	ActionIcon,
	Alert,
	Badge,
	Button,
	Code,
	Group,
	List,
	Modal,
	Paper,
	Stack,
	Text,
	Textarea,
	Tooltip,
} from '@mantine/core';
import {
	IconAlertCircle,
	IconCheck,
	IconClipboard,
	IconFileImport,
	IconInfoCircle,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import type {
	DispositionCatalogImportDryRunResponse,
	DispositionCatalogImportRequest,
	DispositionCatalogImportSuccessResponse,
} from '~/models/DispositionCatalogModels';
import { getErrorMessage } from '~/utils/httpClient';
import { useImportDispositionNodes } from '~/queries/dispositionNodesQueries';
import {
	DispositionImportError,
	parseDispositionCatalogImportPayload,
} from '../../utils/dispositionImportExport';
import styles from './DispositionImportModal.module.css';

type DispositionImportModalProps = {
	opened: boolean;
	onClose: () => void;
	onImported?: (response: DispositionCatalogImportSuccessResponse) => void;
};

type ValidationState =
	| {
			status: 'idle';
			response: null;
	  }
	| {
			status: 'validating';
			response: null;
	  }
	| {
			status: 'invalid';
			response: DispositionCatalogImportDryRunResponse;
	  }
	| {
			status: 'valid';
			response: DispositionCatalogImportDryRunResponse;
	  };

type ClipboardState =
	| 'idle'
	| 'loading'
	| 'loaded'
	| 'empty'
	| 'blocked'
	| 'error';

const getLocalValidationMessage = (
	error: unknown,
	t: (key: string, options?: Record<string, unknown>) => string
) => {
	if (error instanceof DispositionImportError) {
		switch (error.code) {
			case 'invalid-json':
				return t('list.importModal.validation.invalidJson');
			case 'missing-name':
				return t('list.importModal.validation.missingName');
			case 'missing-type':
				return t('list.importModal.validation.missingType');
			case 'missing-nodes':
				return t('list.importModal.validation.missingNodes');
			case 'missing-node-name':
				return t('list.importModal.validation.missingNodeName');
			case 'invalid-order':
				return t('list.importModal.validation.invalidOrder');
			case 'name-too-long':
				return t('list.importModal.validation.nameTooLong');
			case 'description-too-long':
				return t('list.importModal.validation.descriptionTooLong');
			case 'too-many-nodes':
				return t('list.importModal.validation.tooManyNodes');
			case 'too-deep':
				return t('list.importModal.validation.tooDeep');
			default:
				return null;
		}
	}

	return null;
};

const renderTreeNodes = (
	nodes: DispositionCatalogImportRequest['dispositionNodes'],
	depth = 0
): ReactNode[] =>
	nodes.flatMap((node, index) => [
		<Text
			key={`${depth}-${index}-${node.name}`}
			size='sm'
			c='dimmed'
			className={styles.previewNode}
		>
			{`${'  '.repeat(depth)}• ${node.name}`}
		</Text>,
		...renderTreeNodes(node.children, depth + 1),
	]);

const DispositionImportModal: React.FC<DispositionImportModalProps> = ({
	opened,
	onClose,
	onImported,
}) => {
	const { t } = useTranslation('outcomes');
	const isMobile = useMediaQuery('(max-width: 48em)', false);
	const importMutation = useImportDispositionNodes();
	const [jsonValue, setJsonValue] = useState('');
	const [validationState, setValidationState] = useState<ValidationState>({
		status: 'idle',
		response: null,
	});
	const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(
		null
	);
	const [activeAction, setActiveAction] = useState<
		'validate' | 'import' | null
	>(null);
	const [clipboardState, setClipboardState] = useState<ClipboardState>('idle');

	const readClipboardText = useCallback(async () => {
		if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
			return { status: 'blocked' as const, text: null };
		}

		try {
			const text = await navigator.clipboard.readText();

			if (!text.trim()) {
				return { status: 'empty' as const, text: null };
			}

			return { status: 'loaded' as const, text };
		} catch (error) {
			return {
				status:
					error instanceof DOMException
						? ('blocked' as const)
						: ('error' as const),
				text: null,
			};
		}
	}, []);

	const applyClipboardText = useCallback((text: string) => {
		setJsonValue(text);
		setLocalErrorMessage(null);
		setValidationState({ status: 'idle', response: null });
	}, []);

	const syncClipboardValue = useCallback(
		async (notifyOnFailure: boolean) => {
			setClipboardState('loading');

			const result = await readClipboardText();

			if (result.status === 'loaded' && result.text) {
				applyClipboardText(result.text);
				setClipboardState('loaded');
				return;
			}

			setClipboardState(result.status);

			if (notifyOnFailure) {
				if (result.status === 'empty') {
					notifications.show({
						title: t('list.importModal.notifications.clipboardEmptyTitle'),
						message: t('list.importModal.notifications.clipboardEmptyMessage'),
						color: 'gray',
					});
					return;
				}

				notifications.show({
					title: t('list.importModal.notifications.clipboardUnavailableTitle'),
					message: t(
						'list.importModal.notifications.clipboardUnavailableMessage'
					),
					color: 'yellow',
				});
			}
		},
		[applyClipboardText, readClipboardText, t]
	);

	useEffect(() => {
		if (!opened) {
			return;
		}

		let isCancelled = false;

		setJsonValue('');
		setValidationState({ status: 'idle', response: null });
		setLocalErrorMessage(null);
		setActiveAction(null);
		setClipboardState('idle');

		const loadClipboard = async () => {
			setClipboardState('loading');
			const result = await readClipboardText();

			if (isCancelled) {
				return;
			}

			if (result.status === 'loaded' && result.text) {
				applyClipboardText(result.text);
				setClipboardState('loaded');
				return;
			}

			setClipboardState(result.status);
		};

		void loadClipboard();

		return () => {
			isCancelled = true;
		};
	}, [applyClipboardText, opened, readClipboardText]);

	const handleJsonChange = (value: string) => {
		setJsonValue(value);
		setLocalErrorMessage(null);
		setClipboardState('idle');

		if (validationState.status !== 'idle') {
			setValidationState({ status: 'idle', response: null });
		}
	};

	const handleValidate = async () => {
		setLocalErrorMessage(null);

		try {
			const payload = parseDispositionCatalogImportPayload(jsonValue);
			setActiveAction('validate');

			const response = (await importMutation.mutateAsync({
				...payload,
				dryRun: true,
			})) as DispositionCatalogImportDryRunResponse;

			setValidationState({
				status: response.valid ? 'valid' : 'invalid',
				response,
			});
		} catch (error) {
			setLocalErrorMessage(
				getLocalValidationMessage(error, t) ?? getErrorMessage(error)
			);
			setValidationState({ status: 'idle', response: null });
		} finally {
			setActiveAction(null);
		}
	};

	const handleImport = async () => {
		if (validationState.status !== 'valid') {
			return;
		}

		try {
			setActiveAction('import');

			const payload = parseDispositionCatalogImportPayload(jsonValue);
			const response = (await importMutation.mutateAsync({
				...payload,
				dryRun: false,
			})) as DispositionCatalogImportSuccessResponse;

			notifications.show({
				title: t('list.importModal.notifications.successTitle'),
				message: t('list.importModal.notifications.successMessage', {
					totalCreated: response.totalCreated,
				}),
				color: 'green',
			});

			onImported?.(response);
			onClose();
		} catch (error) {
			const localMessage = getLocalValidationMessage(error, t);

			notifications.show({
				title: t('list.importModal.notifications.errorTitle'),
				message: localMessage ?? getErrorMessage(error),
				color: 'red',
			});
		} finally {
			setActiveAction(null);
		}
	};

	const previewStatus = useMemo(() => {
		if (validationState.status === 'valid') {
			return {
				icon: <IconCheck size={16} color='var(--mantine-color-green-6)' />,
				title: t('list.importModal.preview.validTitle'),
				description: t('list.importModal.preview.validDescription', {
					totalNodes: validationState.response.totalNodes,
				}),
			};
		}

		if (validationState.status === 'invalid') {
			return {
				icon: <IconAlertCircle size={16} color='var(--mantine-color-red-6)' />,
				title: t('list.importModal.preview.invalidTitle'),
				description: t('list.importModal.preview.invalidDescription'),
			};
		}

		return {
			icon: <IconInfoCircle size={16} color='var(--mantine-color-blue-6)' />,
			title: t('list.importModal.preview.idleTitle'),
			description: t('list.importModal.preview.idleDescription'),
		};
	}, [t, validationState]);

	const clipboardBadgeLabel = (() => {
		switch (clipboardState) {
			case 'loading':
				return t('list.importModal.clipboard.loading');
			case 'loaded':
				return t('list.importModal.clipboard.loaded');
			case 'empty':
				return t('list.importModal.clipboard.empty');
			case 'blocked':
				return t('list.importModal.clipboard.blocked');
			case 'error':
				return t('list.importModal.clipboard.error');
			default:
				return t('list.importModal.clipboard.idle');
		}
	})();

	const clipboardBadgeColor = (() => {
		switch (clipboardState) {
			case 'loading':
				return 'blue';
			case 'loaded':
				return 'green';
			case 'empty':
				return 'gray';
			case 'blocked':
				return 'yellow';
			case 'error':
				return 'red';
			default:
				return 'gray';
		}
	})();

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('list.importModal.title')}
			centered
			size='95vw'
			fullScreen={isMobile}
			radius={isMobile ? 0 : 'lg'}
			overlayProps={{ opacity: 0.45, blur: 2 }}
			classNames={{
				content: styles.modalContent,
				header: styles.modalHeader,
				body: styles.modalBody,
				title: styles.modalTitle,
			}}
		>
			<Stack gap='md' className={styles.modalRoot}>
				<Text size='sm' c='dimmed' className={styles.intro}>
					{t('list.importModal.intro')}
				</Text>

				<div className={styles.workspace}>
					<Paper withBorder radius='md' p='md' className={styles.panel}>
						<Stack gap='sm' className={styles.panelStack}>
							<Group justify='space-between' align='flex-start' gap='sm'>
								<Stack gap={2} className={styles.fieldMeta}>
									<Text fw={600} size='sm'>
										{t('list.importModal.textareaLabel')}
									</Text>
									<Text size='xs' c='dimmed'>
										{t('list.importModal.helper')}
									</Text>
								</Stack>

								<Group gap='xs' wrap='nowrap' align='center'>
									<Badge variant='light' color={clipboardBadgeColor} size='sm'>
										{clipboardBadgeLabel}
									</Badge>

									<Tooltip
										label={t('list.importModal.clipboardAction')}
										withArrow
									>
										<ActionIcon
											variant='light'
											color='blue'
											size='lg'
											radius='md'
											onClick={() => void syncClipboardValue(true)}
											loading={clipboardState === 'loading'}
											aria-label={t('list.importModal.clipboardAction')}
										>
											<IconClipboard size={16} />
										</ActionIcon>
									</Tooltip>
								</Group>
							</Group>

							<Textarea
								placeholder={t('list.importModal.placeholder')}
								value={jsonValue}
								onChange={(event) =>
									handleJsonChange(event.currentTarget.value)
								}
								spellCheck={false}
								autosize={false}
								classNames={{
									root: styles.textareaRoot,
									wrapper: styles.textareaWrapper,
									input: styles.textareaInput,
								}}
								aria-label={t('list.importModal.textareaLabel')}
							/>

							{localErrorMessage ? (
								<Alert
									icon={<IconAlertCircle size={16} />}
									color='red'
									variant='light'
								>
									{localErrorMessage}
								</Alert>
							) : null}
						</Stack>
					</Paper>

					<div className={styles.previewRail}>
						<div className={styles.previewRailInner}>
							<Button
								type='button'
								variant='light'
								onClick={handleValidate}
								leftSection={<IconCheck size={16} />}
								loading={activeAction === 'validate'}
								disabled={!jsonValue.trim() || importMutation.isPending}
								className={styles.previewButton}
							>
								{t('list.importModal.validate')}
							</Button>
						</div>
					</div>

					<Paper withBorder radius='md' p='md' className={styles.panel}>
						<Stack gap='sm' className={styles.panelStack}>
							<Group gap='xs'>
								{previewStatus.icon}
								<Text fw={600} size='sm'>
									{previewStatus.title}
								</Text>
							</Group>

							<Text size='sm' c='dimmed'>
								{previewStatus.description}
							</Text>

							{validationState.status === 'valid' ? (
								<Stack gap='xs' className={styles.previewContent}>
									<Group gap='xs' wrap='wrap'>
										<Badge variant='light' color='green' size='sm'>
											{t('list.importModal.preview.nodesCount', {
												totalNodes: validationState.response.totalNodes,
											})}
										</Badge>
										<Badge variant='light' color='blue' size='sm'>
											{t('list.importModal.preview.rootNodesCount', {
												rootNodes: validationState.response.nodes?.length ?? 0,
											})}
										</Badge>
									</Group>

									<Stack gap={2}>
										{renderTreeNodes(validationState.response.nodes ?? [])}
									</Stack>
								</Stack>
							) : validationState.status === 'invalid' ? (
								<List size='sm' spacing='xs' className={styles.previewContent}>
									{validationState.response.errors?.map((error, index) => (
										<List.Item key={`${error.path}-${index}`}>
											<Text size='sm'>
												<Code>{error.path}</Code> {error.message}
											</Text>
										</List.Item>
									))}
								</List>
							) : null}
						</Stack>
					</Paper>
				</div>

				<Group
					justify='space-between'
					align='center'
					wrap='wrap'
					className={styles.footer}
				>
					<Button variant='default' type='button' onClick={onClose}>
						{t('actions.cancel', { ns: 'common' })}
					</Button>

					<Group gap='xs' wrap='wrap' className={styles.actions}>
						<Button
							type='button'
							onClick={handleImport}
							leftSection={<IconFileImport size={16} />}
							loading={activeAction === 'import'}
							disabled={validationState.status !== 'valid'}
							fullWidth={isMobile}
						>
							{t('list.importModal.import')}
						</Button>
					</Group>
				</Group>
			</Stack>
		</Modal>
	);
};

export default DispositionImportModal;
