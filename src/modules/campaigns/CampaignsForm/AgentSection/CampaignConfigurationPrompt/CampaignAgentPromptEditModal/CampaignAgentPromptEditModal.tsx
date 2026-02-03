import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import { useParams } from 'react-router';
import {
	Badge,
	Button,
	Group,
	Modal,
	ScrollArea,
	Stack,
	Text,
	UnstyledButton,
} from '@mantine/core';
import { IconDeviceFloppy } from '@tabler/icons-react';
import MDEditor from '@uiw/react-md-editor';
import { useTranslation } from 'react-i18next';
import { useCampaignFormContext } from '../../../../campaignFormFunctions';
import { usePromptVariables } from '~/hooks/usePromptVariables';
import styles from './CampaignAgentPromptEditModal.module.css';
import '@uiw/react-md-editor/markdown-editor.css';

interface CampaignAgentPromptEditModalProps {
	opened: boolean;
	onClose: () => void;
}

const CampaignAgentPromptEditModal: React.FC<
	CampaignAgentPromptEditModalProps
> = ({ opened, onClose }) => {
	const { t } = useTranslation(['campaigns', 'common']);
	const { campaignId: routeCampaignId } = useParams();
	const form = useCampaignFormContext();
	const campaignId =
		Number(routeCampaignId) ||
		(form.values as { id?: number } | undefined)?.id ||
		0;
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const lastCursorRef = useRef<number | null>(null);
	const variableMenuRef = useRef<HTMLDivElement | null>(null);
	const [showVariableMenu, setShowVariableMenu] = useState(false);
	const [variableFilter, setVariableFilter] = useState('');
	const [activeVariableIndex, setActiveVariableIndex] = useState(0);
	const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
	const currentPrompt =
		form.values.agentConfig?.conversationConfig?.agent?.prompt?.prompt || '';
	const [draft, setDraft] = useState(currentPrompt);
	const allVariables = usePromptVariables(campaignId);

	useEffect(() => {
		if (opened) {
			setDraft(currentPrompt);
		}
	}, [opened, currentPrompt]);

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

	const statusLabel = useMemo(() => {
		return hasDraft
			? t('form.agent.prompt.simpleModal.chars', { count: charCount })
			: t('form.agent.prompt.status.empty');
	}, [charCount, hasDraft, t]);

	const getCaretClientPosition = useCallback(
		(textarea: HTMLTextAreaElement, caretIndex: number) => {
			const div = document.createElement('div');
			const span = document.createElement('span');
			const computed = window.getComputedStyle(textarea);
			const properties = [
				'boxSizing',
				'width',
				'height',
				'overflowX',
				'overflowY',
				'borderTopWidth',
				'borderRightWidth',
				'borderBottomWidth',
				'borderLeftWidth',
				'paddingTop',
				'paddingRight',
				'paddingBottom',
				'paddingLeft',
				'fontStyle',
				'fontVariant',
				'fontWeight',
				'fontStretch',
				'fontSize',
				'fontFamily',
				'lineHeight',
				'textTransform',
				'letterSpacing',
			];

			div.style.position = 'absolute';
			div.style.visibility = 'hidden';
			div.style.whiteSpace = 'pre-wrap';
			div.style.wordWrap = 'break-word';
			div.style.top = '0';
			div.style.left = '-9999px';
			properties.forEach((property) => {
				div.style.setProperty(property, computed.getPropertyValue(property));
			});

			const text = textarea.value;
			const safeIndex = Math.max(0, Math.min(caretIndex, text.length));
			div.textContent = text.slice(0, safeIndex);
			span.textContent = '\u200b';
			div.appendChild(span);
			div.scrollTop = textarea.scrollTop;
			div.scrollLeft = textarea.scrollLeft;
			document.body.appendChild(div);

			const spanRect = span.getBoundingClientRect();
			const divRect = div.getBoundingClientRect();
			const textareaRect = textarea.getBoundingClientRect();
			document.body.removeChild(div);

			return {
				x: textareaRect.left + (spanRect.left - divRect.left),
				y: textareaRect.top + (spanRect.top - divRect.top),
			};
		},
		[]
	);

	const updateMenuPosition = useCallback(() => {
		const textarea = textareaRef.current;
		if (!textarea) return;
		const caretIndex =
			textarea.selectionStart ?? lastCursorRef.current ?? textarea.value.length;
		const caretPosition = getCaretClientPosition(textarea, caretIndex);
		setMenuPosition({ x: caretPosition.x + 8, y: caretPosition.y + 18 });
	}, [getCaretClientPosition]);

	const handleVariableInsert = useCallback(
		(variableName: string) => {
			const textarea = textareaRef.current;
			const currentValue = draft || '';
			const insertion = `{{${variableName}}}`;

			let cursorIndex = textarea?.selectionStart;
			if (typeof cursorIndex !== 'number') {
				cursorIndex = lastCursorRef.current ?? currentValue.length;
			}

			const before = currentValue.slice(0, cursorIndex);
			const after = currentValue.slice(cursorIndex);
			const triggerMatch = before.match(/\{\{[a-zA-Z0-9_\-\.]*$/);
			const replaceFrom = triggerMatch
				? cursorIndex - (triggerMatch[0]?.length || 0)
				: cursorIndex;

			const nextValue = currentValue.slice(0, replaceFrom) + insertion + after;
			const nextCursor =
				currentValue.slice(0, replaceFrom).length + insertion.length;

			setDraft(nextValue);
			setTimeout(() => {
				if (!textareaRef.current) return;
				textareaRef.current.focus();
				textareaRef.current.setSelectionRange(nextCursor, nextCursor);
				lastCursorRef.current = nextCursor;
			}, 0);
			setShowVariableMenu(false);
			setVariableFilter('');
		},
		[draft]
	);

	const handleEditorKeyUp = useCallback(
		(event: React.SyntheticEvent<HTMLTextAreaElement>) => {
			const target = event.currentTarget;
			lastCursorRef.current = target.selectionStart;

			const caretPosition = target.selectionStart ?? 0;
			const textBeforeCaret = target.value.slice(0, caretPosition);
			const triggerMatch = textBeforeCaret.match(/\{\{([a-zA-Z0-9_\-\.]*)$/);

			if (triggerMatch) {
				setVariableFilter(triggerMatch[1] || '');
				setShowVariableMenu(true);
				updateMenuPosition();
			} else {
				setShowVariableMenu(false);
				setVariableFilter('');
			}
		},
		[updateMenuPosition]
	);

	const handleEditorKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
			if (!showVariableMenu || filteredVariables.length === 0) return;

			if (event.key === 'ArrowDown') {
				event.preventDefault();
				setActiveVariableIndex((current) =>
					current + 1 < filteredVariables.length ? current + 1 : 0
				);
			} else if (event.key === 'ArrowUp') {
				event.preventDefault();
				setActiveVariableIndex((current) =>
					current - 1 >= 0 ? current - 1 : filteredVariables.length - 1
				);
			} else if (event.key === 'Enter' || event.key === 'Tab') {
				event.preventDefault();
				const variable = filteredVariables[activeVariableIndex];
				if (variable) {
					handleVariableInsert(variable.name);
				}
			} else if (event.key === 'Escape') {
				event.preventDefault();
				setShowVariableMenu(false);
				setVariableFilter('');
			}
		},
		[
			activeVariableIndex,
			filteredVariables,
			handleVariableInsert,
			showVariableMenu,
		]
	);

	useLayoutEffect(() => {
		if (!showVariableMenu || !variableMenuRef.current) return;
		const menuRect = variableMenuRef.current.getBoundingClientRect();
		const padding = 8;
		const maxX = window.innerWidth - menuRect.width - padding;
		const maxY = window.innerHeight - menuRect.height - padding;
		const nextX = Math.max(padding, Math.min(menuPosition.x, maxX));
		const nextY = Math.max(padding, Math.min(menuPosition.y, maxY));
		if (nextX !== menuPosition.x || nextY !== menuPosition.y) {
			setMenuPosition({ x: nextX, y: nextY });
		}
	}, [menuPosition.x, menuPosition.y, showVariableMenu]);

	const handleSave = () => {
		form.setFieldValue(
			'agentConfig.conversationConfig.agent.prompt.prompt',
			draft
		);
		onClose();
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('form.agent.prompt.simpleModal.title')}
			fullScreen
			centered
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
							{t('form.agent.prompt.simpleModal.title')}
						</Text>
						<Text size='xs' c='dimmed' className={styles.subtitle}>
							{t('form.agent.prompt.simpleModal.description')}
						</Text>
					</div>
					<Badge size='sm' variant='light' color='gray'>
						{statusLabel}
					</Badge>
				</div>
				<div className={styles.editorArea}>
					<div data-color-mode='light' className={styles.editorWrapper}>
						<Text c='dimmed' className={styles.editorHint}>
							{t('form.agent.prompt.editor.variables.hint')}
						</Text>
						<MDEditor
							value={draft}
							onChange={(val) => setDraft(val || '')}
							preview='edit'
							height='100%'
							className={styles.mdEditor}
							textareaProps={
								{
									placeholder: t('form.agent.prompt.simpleModal.placeholder'),
									ref: textareaRef,
									onKeyUp: handleEditorKeyUp,
									onKeyDown: handleEditorKeyDown,
									onClick: (event: any) => {
										handleEditorKeyUp(event);
										updateMenuPosition();
									},
									onSelect: (event: any) => {
										lastCursorRef.current = event.currentTarget.selectionStart;
										updateMenuPosition();
									},
								} as any
							}
						/>
					</div>
					{showVariableMenu && filteredVariables.length > 0 && (
						<div
							ref={variableMenuRef}
							className={styles.variableDropdown}
							style={{
								position: 'fixed',
								left: menuPosition.x,
								top: menuPosition.y,
								width: 260,
								zIndex: 1000,
							}}
						>
							<Stack gap={4}>
								<Group justify='space-between' align='center'>
									<Text size='xs' fw={600}>
										{t('form.agent.prompt.editor.variables.popover.title')}
									</Text>
									<Badge size='xs' variant='light' color='gray' radius='sm'>
										{t('form.agent.prompt.editor.variables.popover.badge')}
									</Badge>
								</Group>
								<Text size='xs' c='dimmed'>
									{t(
										'form.agent.prompt.editor.variables.popover.navigationHint'
									)}
								</Text>
								<ScrollArea.Autosize mah={180}>
									<Stack gap={2} className={styles.variableList}>
										{filteredVariables.map((variable, index) => (
											<UnstyledButton
												type='button'
												key={`${variable.source}-${variable.name}`}
												className={styles.variableOption}
												data-active={index === activeVariableIndex}
												onMouseDown={(event) => event.preventDefault()}
												onMouseEnter={() => setActiveVariableIndex(index)}
												onClick={() => handleVariableInsert(variable.name)}
											>
												<Group
													justify='space-between'
													align='center'
													wrap='nowrap'
													gap='xs'
												>
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
														color={
															variable.source === 'schema' ? 'blue' : 'gray'
														}
														radius='sm'
													>
														{variable.source === 'schema'
															? t(
																	'form.agent.prompt.editor.variables.popover.source.dyn'
																)
															: t(
																	'form.agent.prompt.editor.variables.popover.source.sys'
																)}
													</Badge>
												</Group>
											</UnstyledButton>
										))}
										{filteredVariables.length === 0 && (
											<Text size='xs' c='dimmed' ta='center' py='xs'>
												{t('form.agent.prompt.editor.variables.popover.empty')}
											</Text>
										)}
									</Stack>
								</ScrollArea.Autosize>
							</Stack>
						</div>
					)}
				</div>
				<div className={styles.footer}>
					<Text size='xs' c='dimmed'>
						{t('form.agent.prompt.simpleModal.helper')}
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
	);
};

export default CampaignAgentPromptEditModal;
