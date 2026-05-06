import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	Badge,
	Button,
	Divider,
	Group,
	Modal,
	Portal,
	ScrollArea,
	Stack,
	Text,
	TextInput,
	UnstyledButton,
	useComputedColorScheme,
} from '@mantine/core';
import { IconBraces, IconDeviceFloppy, IconSearch } from '@tabler/icons-react';
import MDEditor from '@uiw/react-md-editor';
import { useTranslation } from 'react-i18next';
import { usePromptVariables } from '~/hooks/usePromptVariables';
import styles from './PromptEditModal.module.css';
import '@uiw/react-md-editor/markdown-editor.css';

interface PromptEditModalProps {
	opened: boolean;
	onClose: () => void;
	value: string;
	onSave: (value: string) => void;
	campaignId: number;
	title?: string;
	description?: string;
	placeholder?: string;
	helperText?: string;
}

const PromptEditModal: React.FC<PromptEditModalProps> = ({
	opened,
	onClose,
	value,
	onSave,
	campaignId,
	title,
	description,
	placeholder,
	helperText,
}) => {
	const { t } = useTranslation([
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const contextMenuRef = useRef<HTMLDivElement | null>(null);
	const lastCursorRef = useRef<number | null>(null);
	const searchInputRef = useRef<HTMLInputElement | null>(null);
	const variableRowsRef = useRef<Map<number, HTMLButtonElement>>(new Map());
	const historyRef = useRef<string[]>([value]);
	const historyIndexRef = useRef<number>(0);
	const skipHistoryRef = useRef<boolean>(false);
	const [showContextMenu, setShowContextMenu] = useState(false);
	const [contextMenuPosition, setContextMenuPosition] = useState({
		x: 0,
		y: 0,
	});
	const [showVariableMenu, setShowVariableMenu] = useState(false);
	const [variableFilter, setVariableFilter] = useState('');
	const [activeVariableIndex, setActiveVariableIndex] = useState(0);
	const [draft, setDraft] = useState(value);
	const allVariables = usePromptVariables(campaignId);

	useEffect(() => {
		if (opened) {
			setDraft(value);
			historyRef.current = [value];
			historyIndexRef.current = 0;
		}
	}, [opened, value]);

	useEffect(() => {
		if (showVariableMenu) {
			setTimeout(() => searchInputRef.current?.focus(), 0);
		}
	}, [showVariableMenu]);

	const trimmedDraft = draft.trim();
	const hasDraft = trimmedDraft.length > 0;
	const charCount = draft.length;

	const filteredVariables = useMemo(() => {
		if (!variableFilter.trim()) return allVariables;
		const search = variableFilter.toLowerCase();
		return allVariables.filter((variable) =>
			variable.name.toLowerCase().includes(search)
		);
	}, [allVariables, variableFilter]);

	const schemaVars = useMemo(
		() => filteredVariables.filter((v) => v.source === 'schema'),
		[filteredVariables]
	);
	const systemVars = useMemo(
		() => filteredVariables.filter((v) => v.source === 'system'),
		[filteredVariables]
	);

	const usedVariables = useMemo(() => {
		const matches = (draft || '').matchAll(/\{\{([a-zA-Z0-9_\-\.]+)\}\}/g);
		const seen = new Set<string>();
		const out: { name: string; status: 'schema' | 'system' | 'unknown' }[] = [];
		for (const m of matches) {
			const name = m[1];
			if (seen.has(name)) continue;
			seen.add(name);
			const known = allVariables.find((v) => v.name === name);
			out.push({ name, status: known?.source ?? 'unknown' });
		}
		return out;
	}, [draft, allVariables]);

	useEffect(() => {
		if (!showVariableMenu) return;
		setActiveVariableIndex(0);
	}, [showVariableMenu, variableFilter]);

	useEffect(() => {
		if (!showVariableMenu) return;
		setActiveVariableIndex((current) =>
			Math.min(current, Math.max(filteredVariables.length - 1, 0))
		);
	}, [filteredVariables.length, showVariableMenu]);

	useLayoutEffect(() => {
		if (!showContextMenu || !contextMenuRef.current) return;
		contextMenuRef.current.style.left = `${contextMenuPosition.x}px`;
		contextMenuRef.current.style.top = `${contextMenuPosition.y}px`;
	}, [contextMenuPosition.x, contextMenuPosition.y, showContextMenu]);

	useEffect(() => {
		if (!showVariableMenu) {
			variableRowsRef.current.clear();
			return;
		}
		const el = variableRowsRef.current.get(activeVariableIndex);
		el?.scrollIntoView({ block: 'nearest' });
	}, [activeVariableIndex, showVariableMenu]);

	const modalTitle = title ?? t('form.agent.prompt.simpleModal.title');
	const modalDescription =
		description ?? t('form.agent.prompt.simpleModal.description');
	const modalPlaceholder =
		placeholder ?? t('form.agent.prompt.simpleModal.placeholder');
	const modalHelper = helperText ?? t('form.agent.prompt.simpleModal.helper');
	const editorColorMode = useComputedColorScheme('light');

	const statusLabel = useMemo(() => {
		return hasDraft
			? t('form.agent.prompt.simpleModal.chars', { count: charCount })
			: t('form.agent.prompt.status.empty');
	}, [charCount, hasDraft, t]);

	const closePalette = useCallback(() => {
		setShowVariableMenu(false);
		setVariableFilter('');
		setTimeout(() => textareaRef.current?.focus(), 0);
	}, []);

	const pushDraft = useCallback((next: string) => {
		if (!skipHistoryRef.current) {
			const truncated = historyRef.current.slice(
				0,
				historyIndexRef.current + 1
			);
			truncated.push(next);
			historyRef.current = truncated;
			historyIndexRef.current = truncated.length - 1;
		}
		skipHistoryRef.current = false;
		setDraft(next);
	}, []);

	const handleUndo = useCallback(() => {
		if (historyIndexRef.current > 0) {
			historyIndexRef.current -= 1;
			skipHistoryRef.current = true;
			setDraft(historyRef.current[historyIndexRef.current]);
		}
	}, []);

	const handleRedo = useCallback(() => {
		if (historyIndexRef.current < historyRef.current.length - 1) {
			historyIndexRef.current += 1;
			skipHistoryRef.current = true;
			setDraft(historyRef.current[historyIndexRef.current]);
		}
	}, []);

	const handleVariableInsert = useCallback(
		(variableName: string) => {
			const currentValue = draft || '';
			const insertion = `{{${variableName}}}`;
			const cursorIndex = lastCursorRef.current ?? currentValue.length;

			const nextValue =
				currentValue.slice(0, cursorIndex) +
				insertion +
				currentValue.slice(cursorIndex);
			const nextCursor = cursorIndex + insertion.length;

			pushDraft(nextValue);
			setTimeout(() => {
				if (!textareaRef.current) return;
				textareaRef.current.focus();
				textareaRef.current.setSelectionRange(nextCursor, nextCursor);
				lastCursorRef.current = nextCursor;
			}, 0);
			setShowVariableMenu(false);
			setVariableFilter('');
		},
		[draft, pushDraft]
	);

	const handleContextMenu = useCallback(
		(event: React.MouseEvent<HTMLTextAreaElement>) => {
			event.preventDefault();
			lastCursorRef.current =
				event.currentTarget.selectionStart ?? lastCursorRef.current ?? 0;
			setContextMenuPosition({ x: event.clientX, y: event.clientY });
			setShowContextMenu(true);
		},
		[]
	);

	const handleInsertVariableClick = useCallback(() => {
		setShowContextMenu(false);
		setVariableFilter('');
		setShowVariableMenu(true);
	}, []);

	const handleEditorCursorUpdate = useCallback(
		(event: React.SyntheticEvent<HTMLTextAreaElement>) => {
			lastCursorRef.current = event.currentTarget.selectionStart;
		},
		[]
	);

	const handleEditorKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
			const mod = event.metaKey || event.ctrlKey;
			if (!mod) return;
			if (event.key === 'z' || event.key === 'Z') {
				event.preventDefault();
				if (event.shiftKey) {
					handleRedo();
				} else {
					handleUndo();
				}
			} else if (event.key === 'y' || event.key === 'Y') {
				event.preventDefault();
				handleRedo();
			}
		},
		[handleRedo, handleUndo]
	);

	const handlePaletteKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLInputElement>) => {
			if (event.key === 'ArrowDown') {
				event.preventDefault();
				setActiveVariableIndex((i) =>
					i + 1 < filteredVariables.length ? i + 1 : 0
				);
			} else if (event.key === 'ArrowUp') {
				event.preventDefault();
				setActiveVariableIndex((i) =>
					i - 1 >= 0 ? i - 1 : filteredVariables.length - 1
				);
			} else if (event.key === 'Enter') {
				event.preventDefault();
				const variable = filteredVariables[activeVariableIndex];
				if (variable) handleVariableInsert(variable.name);
			} else if (event.key === 'Escape') {
				event.preventDefault();
				closePalette();
			}
		},
		[activeVariableIndex, closePalette, filteredVariables, handleVariableInsert]
	);

	const handleSave = () => {
		onSave(draft);
		onClose();
	};

	const renderVariableRow = (
		variable: (typeof allVariables)[number],
		index: number
	) => (
		<UnstyledButton
			type='button'
			key={`${variable.source}-${variable.name}`}
			ref={(el) => {
				if (el) variableRowsRef.current.set(index, el);
				else variableRowsRef.current.delete(index);
			}}
			className={styles.paletteOption}
			data-active={index === activeVariableIndex}
			onMouseDown={(event) => event.preventDefault()}
			onMouseEnter={() => setActiveVariableIndex(index)}
			onClick={() => handleVariableInsert(variable.name)}
		>
			<Group justify='space-between' align='center' wrap='nowrap' gap='xs'>
				<div className={styles.variableMeta}>
					<Text size='xs' fw={500} lh={1.3}>
						{variable.name}
					</Text>
					{variable.description && (
						<Text size='xs' c='dimmed' lh={1.3} lineClamp={1}>
							{variable.description}
						</Text>
					)}
				</div>
				<Badge
					size='xs'
					variant='dot'
					color={variable.source === 'schema' ? 'blue' : 'gray'}
					radius='sm'
					className={styles.variableSourceBadge}
				>
					{variable.source === 'schema'
						? t('form.agent.prompt.editor.variables.popover.source.dyn')
						: t('form.agent.prompt.editor.variables.popover.source.sys')}
				</Badge>
			</Group>
		</UnstyledButton>
	);

	return (
		<>
			<Modal
				opened={opened}
				onClose={onClose}
				fullScreen
				centered
				zIndex={400}
				closeOnEscape={false}
				styles={{
					body: {
						height: '92dvh',
						padding: 0,
					},
				}}
			>
				<div className={styles.modalShell}>
					<div className={styles.header}>
						<div className={styles.headerContent}>
							<Text size='sm' fw={600} className={styles.title}>
								{modalTitle}
							</Text>
							<Text size='xs' c='dimmed' className={styles.subtitle}>
								{modalDescription}
							</Text>
						</div>
						<Group gap='xs' align='center' wrap='nowrap'>
							<Button
								size='xs'
								variant='light'
								leftSection={<IconBraces size={14} />}
								onClick={handleInsertVariableClick}
							>
								{t('form.agent.prompt.editor.variables.contextMenu.insert')}
							</Button>
							<Badge size='sm' variant='light' color='gray'>
								{statusLabel}
							</Badge>
						</Group>
					</div>
					<div className={styles.editorArea}>
						<div
							data-color-mode={editorColorMode}
							className={styles.editorWrapper}
						>
							<MDEditor
								value={draft}
								onChange={(val) => pushDraft(val || '')}
								preview='edit'
								height='100%'
								className={styles.mdEditor}
								textareaProps={
									{
										placeholder: modalPlaceholder,
										ref: textareaRef,
										onKeyUp: handleEditorCursorUpdate,
										onKeyDown: handleEditorKeyDown,
										onClick: handleEditorCursorUpdate,
										onSelect: handleEditorCursorUpdate,
										onContextMenu: handleContextMenu,
									} as any
								}
							/>
						</div>
					</div>
					{usedVariables.length > 0 && (
						<div className={styles.variablesInUse}>
							<Text size='xs' c='dimmed' fw={500}>
								{t('form.agent.prompt.editor.variables.inUse')}
							</Text>
							<ScrollArea
								type='auto'
								offsetScrollbars='x'
								scrollbarSize={6}
								className={styles.variablesInUseScrollArea}
							>
								<Group
									gap={6}
									wrap='nowrap'
									className={styles.variablesInUseRow}
								>
									{usedVariables.map((v) => (
										<Badge
											key={v.name}
											size='sm'
											variant='dot'
											color={
												v.status === 'schema'
													? 'blue'
													: v.status === 'system'
														? 'gray'
														: 'red'
											}
											radius='sm'
											className={styles.variableBadge}
										>
											{v.name}
										</Badge>
									))}
								</Group>
							</ScrollArea>
						</div>
					)}
					<div className={styles.footer}>
						<Text size='xs' c='dimmed'>
							{modalHelper}
						</Text>
						<Group gap='xs'>
							<Button variant='subtle' size='xs' onClick={onClose}>
								{t('actions.cancel', { ns: 'common' })}
							</Button>
							<Button
								size='xs'
								leftSection={<IconDeviceFloppy size={14} />}
								onClick={handleSave}
							>
								{t('actions.save', { ns: 'common' })}
							</Button>
						</Group>
					</div>
				</div>
			</Modal>

			{showContextMenu && (
				<Portal>
					<div
						className={styles.contextMenuOverlay}
						onMouseDown={() => setShowContextMenu(false)}
					>
						<div
							ref={contextMenuRef}
							className={styles.contextMenu}
							onMouseDown={(e) => e.stopPropagation()}
						>
							<UnstyledButton
								className={styles.contextMenuItem}
								onClick={handleInsertVariableClick}
							>
								<Group gap='xs' align='center'>
									<IconBraces size={14} />
									<Text size='xs' fw={500}>
										{t('form.agent.prompt.editor.variables.contextMenu.insert')}
									</Text>
								</Group>
							</UnstyledButton>
						</div>
					</div>
				</Portal>
			)}

			{showVariableMenu && (
				<Portal>
					<div className={styles.paletteOverlay} onMouseDown={closePalette}>
						<div
							className={styles.palette}
							onMouseDown={(e) => e.stopPropagation()}
						>
							<div className={styles.paletteSearch}>
								<TextInput
									ref={searchInputRef}
									value={variableFilter}
									onChange={(e) => setVariableFilter(e.currentTarget.value)}
									onKeyDown={handlePaletteKeyDown}
									placeholder={t(
										'form.agent.prompt.editor.variables.search.placeholder'
									)}
									leftSection={<IconSearch size={15} />}
									variant='unstyled'
									size='sm'
								/>
							</div>
							<Divider />
							{filteredVariables.length > 0 ? (
								<div className={styles.paletteScrollArea}>
									<Stack gap={0} className={styles.paletteList}>
										{schemaVars.length > 0 && (
											<>
												<Text className={styles.paletteGroupLabel}>
													{t(
														'form.agent.prompt.editor.variables.search.groups.dynamic'
													)}
												</Text>
												{schemaVars.map((v) =>
													renderVariableRow(v, filteredVariables.indexOf(v))
												)}
											</>
										)}
										{systemVars.length > 0 && (
											<>
												<Text className={styles.paletteGroupLabel}>
													{t(
														'form.agent.prompt.editor.variables.search.groups.system'
													)}
												</Text>
												{systemVars.map((v) =>
													renderVariableRow(v, filteredVariables.indexOf(v))
												)}
											</>
										)}
									</Stack>
								</div>
							) : (
								<div className={styles.paletteEmpty}>
									<Text size='xs' c='dimmed' ta='center'>
										{t('form.agent.prompt.editor.variables.search.empty')}
									</Text>
								</div>
							)}
							<Divider />
							<div className={styles.paletteFooter}>
								<Text size='xs' c='dimmed'>
									{t('form.agent.prompt.editor.variables.search.footer')}
								</Text>
							</div>
						</div>
					</div>
				</Portal>
			)}
		</>
	);
};

export default PromptEditModal;
