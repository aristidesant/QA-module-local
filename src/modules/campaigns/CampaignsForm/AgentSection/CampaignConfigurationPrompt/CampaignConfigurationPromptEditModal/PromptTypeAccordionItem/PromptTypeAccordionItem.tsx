import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {
	Accordion,
	Text,
	Select,
	Stack,
	Group,
	Badge,
	ActionIcon,
	ThemeIcon,
	Popover,
	ScrollArea,
	UnstyledButton,
	Modal,
	Tooltip,
} from '@mantine/core';
import { generateDiffData, type DiffResult } from './PromptAiActions/diffUtils';
import ReviewStep from './PromptAiActions/ReviewStep';
import MDEditor from '@uiw/react-md-editor';
import {
	IconHistory,
	IconMessageChatbot,
	IconNotes,
} from '@tabler/icons-react';
import type { CampaignPromptTypeModel } from '~/models/CampaignPromptTypeModel';
import { useGetCampaignPrompts } from '~/queries/campaignPromptQueries';
import { usePromptVariables } from '~/hooks/usePromptVariables';
import CampaignConfigurationPromptHistoryModal from '~/modules/campaigns/CampaignsForm/AgentSection/CampaignConfigurationPrompt/CampaignConfigurationPromptHistoryModal';
import styles from './PromptTypeAccordionItem.module.css';
import '@uiw/react-md-editor/markdown-editor.css';
import PromptAiActions from './PromptAiActions';

type PromptTypeAccordionItemProps = {
	type: CampaignPromptTypeModel;
	value?: string;
	onChange: (value: string) => void;
	campaignId: number;
};

const PromptTypeAccordionItem: React.FC<PromptTypeAccordionItemProps> = ({
	type,
	value,
	onChange,
	campaignId,
}) => {
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const lastCursorRef = useRef<number | null>(null);
	const [showVariableMenu, setShowVariableMenu] = useState(false);
	const [variableFilter, setVariableFilter] = useState('');
	const [activeVariableIndex, setActiveVariableIndex] = useState(0);

	// State for diff preview modal when importing from another campaign
	const [showDiffPreview, setShowDiffPreview] = useState(false);
	const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
	const [diffData, setDiffData] = useState<DiffResult | null>(null);

	const [historyModalOpen, setHistoryModalOpen] = useState(false);

	const { data: otherPrompts } = useGetCampaignPrompts({ typeId: type.id });
	const allVariables = usePromptVariables(campaignId);

	const promptOptions = useMemo(() => {
		if (!otherPrompts) return [];
		return otherPrompts
			.filter((p) => p.campaignId !== campaignId && p.id !== undefined)
			.map((p) => ({
				value: String(p.id),
				label: `${p.campaign?.name}`,
			}));
	}, [otherPrompts, campaignId]);

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

	const handleVariableInsert = useCallback(
		(variableName: string) => {
			const textarea = textareaRef.current;
			const currentValue = value || '';
			const insertion = `{{${variableName}}}`;

			// Determine the best cursor position
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

			onChange(nextValue);
			setTimeout(() => {
				if (!textareaRef.current) return;
				textareaRef.current.focus();
				textareaRef.current.setSelectionRange(nextCursor, nextCursor);
				// Update the ref to the new position
				lastCursorRef.current = nextCursor;
			}, 0);
			setShowVariableMenu(false);
			setVariableFilter('');
		},
		[value, onChange]
	);

	const handleEditorKeyUp = useCallback(
		(event: React.SyntheticEvent<HTMLTextAreaElement>) => {
			const target = event.currentTarget;
			// Update cursor position tracker
			lastCursorRef.current = target.selectionStart;

			const caretPosition = target.selectionStart ?? 0;
			const textBeforeCaret = target.value.slice(0, caretPosition);
			const triggerMatch = textBeforeCaret.match(/\{\{([a-zA-Z0-9_\-\.]*)$/);

			if (triggerMatch) {
				setVariableFilter(triggerMatch[1] || '');
				setShowVariableMenu(true);
			} else {
				setShowVariableMenu(false);
				setVariableFilter('');
			}
		},
		[]
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

	const handlePromptSelect = useCallback(
		(promptId: string | null) => {
			if (!promptId || !otherPrompts) return;
			const selectedPrompt = otherPrompts.find(
				(p) => p.id !== undefined && String(p.id) === promptId
			);
			if (!selectedPrompt?.prompt) return;

			const currentValue = value?.trim() || '';
			const newPrompt = selectedPrompt.prompt;

			// If there's no existing content, apply directly without preview
			if (!currentValue) {
				onChange(newPrompt);
				return;
			}

			// If there's existing content, show diff preview
			const diff = generateDiffData(value || '', newPrompt);
			setDiffData(diff);
			setPendingPrompt(newPrompt);
			setShowDiffPreview(true);
		},
		[onChange, otherPrompts, value]
	);

	const handleApplyPendingPrompt = useCallback(() => {
		if (pendingPrompt) {
			onChange(pendingPrompt);
		}
		setShowDiffPreview(false);
		setPendingPrompt(null);
		setDiffData(null);
	}, [pendingPrompt, onChange]);

	const handleCancelDiffPreview = useCallback(() => {
		setShowDiffPreview(false);
		setPendingPrompt(null);
		setDiffData(null);
	}, []);

	const handleOpenHistory = useCallback(
		(event: React.MouseEvent<HTMLElement>) => {
			event.stopPropagation();
			setHistoryModalOpen(true);
		},
		[]
	);

	const promptLength = useMemo(() => value?.trim().length ?? 0, [value]);
	const promptLines = useMemo(() => {
		if (!value) return 0;
		return value.split('\n').filter((line) => line.trim().length > 0).length;
	}, [value]);
	const isDrafted = promptLength > 0;

	return (
		<Accordion.Item value={String(type.id)} className={styles.accordionItem}>
			<Accordion.Control className={styles.accordionControl}>
				<div className={styles.controlInner}>
					<Group gap='sm' wrap='nowrap'>
						<ThemeIcon color='blue' variant='light' size={24} radius='md'>
							<IconMessageChatbot size={14} />
						</ThemeIcon>
						<div className={styles.controlText}>
							<Text fw={600} size='sm'>
								{type.name}
							</Text>
						</div>
					</Group>
					<div className={styles.controlMeta}>
						<Text
							size='xs'
							className={styles.controlStatus}
							data-filled={isDrafted}
						>
							{isDrafted ? 'Drafted' : 'Empty'}
						</Text>
						<Badge
							size='xs'
							variant='outline'
							color={isDrafted ? 'blue' : 'gray'}
						>
							{promptLines} lines)
						</Badge>
						<Tooltip label='View prompt history' withArrow>
							<ActionIcon
								role='button'
								tabIndex={0}
								variant='light'
								color='gray'
								size='sm'
								aria-label='Prompt history'
								onClick={handleOpenHistory}
								onKeyDown={(event) => {
									event.stopPropagation();
									if (event.key === 'Enter' || event.key === ' ') {
										event.preventDefault();
										setHistoryModalOpen(true);
									}
								}}
							>
								<IconHistory size={14} />
							</ActionIcon>
						</Tooltip>
					</div>
				</div>
			</Accordion.Control>
			<Accordion.Panel className={styles.accordionPanel}>
				<Stack gap='xs'>
					{promptOptions.length > 0 && (
						<Select
							label='Reuse from another campaign'
							placeholder='Load prompt from another campaign...'
							data={promptOptions}
							onChange={handlePromptSelect}
							searchable
							clearable
							size='xs'
							className={styles.promptSelect}
							leftSection={<IconNotes size={16} />}
						/>
					)}
					<Popover
						opened={showVariableMenu && filteredVariables.length > 0}
						onClose={() => setShowVariableMenu(false)}
						position='bottom-start'
						offset={4}
						withinPortal={false}
						trapFocus={false}
						width={300}
					>
						<Popover.Target>
							<div data-color-mode='light' className={styles.editorWrapper}>
								<Text size='xs' c='dimmed' className={styles.editorHint}>
									Keep it under eight lines; highlight tone, persona, and
									constraints.
								</Text>
								<MDEditor
									value={value || ''}
									onChange={(val) => onChange(val || '')}
									preview='edit'
									height={200}
									className={styles.mdEditor}
									textareaProps={
										{
											placeholder: 'Enter your prompt here...',
											ref: textareaRef,
											onKeyUp: handleEditorKeyUp,
											onKeyDown: handleEditorKeyDown,
											onClick: handleEditorKeyUp,
											onSelect: (e: any) => {
												lastCursorRef.current = e.currentTarget.selectionStart;
											},
										} as any
									}
								/>
							</div>
						</Popover.Target>
						<Popover.Dropdown className={styles.variableDropdown}>
							<Stack gap='xs'>
								<Group justify='space-between'>
									<Text size='xs' fw={600}>
										Available variables
									</Text>
									<Badge size='xs' variant='light' color='gray'>
										Dynamic & system
									</Badge>
								</Group>
								<Text size='xs' c='dimmed'>
									Use arrow keys to navigate and Enter to insert.
								</Text>
								<ScrollArea.Autosize mah={220}>
									<Stack gap={4} className={styles.variableList}>
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
												>
													<div className={styles.variableMeta}>
														<Text size='sm' fw={500} lh={1.2}>
															{variable.name}
														</Text>
														{variable.description && (
															<Text size='xs' c='dimmed' lh={1.2} lineClamp={1}>
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
													>
														{variable.source === 'schema' ? 'Dyn' : 'Sys'}
													</Badge>
												</Group>
											</UnstyledButton>
										))}
										{filteredVariables.length === 0 && (
											<Text size='xs' c='dimmed' ta='center' py='xs'>
												No variables available.
											</Text>
										)}
									</Stack>
								</ScrollArea.Autosize>
							</Stack>
						</Popover.Dropdown>
					</Popover>
					<PromptAiActions
						prompt={value}
						onApply={(content) => onChange(content)}
						type={type}
					/>
				</Stack>
			</Accordion.Panel>

			<Modal
				opened={showDiffPreview}
				onClose={handleCancelDiffPreview}
				title='Review changes before importing'
				size='80%'
				centered
			>
				<ReviewStep
					diffData={diffData}
					onApply={handleApplyPendingPrompt}
					onCancel={handleCancelDiffPreview}
				/>
			</Modal>

			<CampaignConfigurationPromptHistoryModal
				opened={historyModalOpen}
				onClose={() => setHistoryModalOpen(false)}
				campaignId={campaignId}
				campaignPromptTypeId={type.id}
				currentPromptText={value}
				onSelect={(selectedPrompt) => {
					onChange(selectedPrompt);
					setHistoryModalOpen(false);
				}}
			/>
		</Accordion.Item>
	);
};

export default PromptTypeAccordionItem;
