import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import { Popover, Text, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconSearch, IconSquaresDiagonal } from '@tabler/icons-react';
import { WORKFLOW_NODE_TYPES } from '../nodeTypes';
import styles from './WorkflowNodeSearch.module.css';

/** Node types that should be excluded from search results */
const EXCLUDED_TYPES = new Set<string>([
	WORKFLOW_NODE_TYPES.START,
	WORKFLOW_NODE_TYPES.END,
]);

const WorkflowNodeSearch = () => {
	const { t } = useTranslation(['campaign.form.workflow', 'common']);
	const { getNodes, setNodes, fitView } = useReactFlow();
	const [query, setQuery] = useState('');
	const [opened, setOpened] = useState(false);
	const [activeIndex, setActiveIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);

	const results = useMemo(() => {
		if (!query.trim()) return [];
		const lowerQuery = query.toLowerCase();
		return getNodes().filter((node) => {
			if (EXCLUDED_TYPES.has(node.type ?? '')) return false;
			const label =
				(node.data as { label?: string }).label ??
				(node.data as { type?: string }).type ??
				'';
			return label.toLowerCase().includes(lowerQuery);
		});
	}, [query, getNodes]);

	const handleSelect = useCallback(
		(node: Node) => {
			setNodes((nodes) =>
				nodes.map((n) => ({
					...n,
					selected: n.id === node.id,
				}))
			);
			fitView({ nodes: [{ id: node.id }], duration: 500, padding: 0.5 });
			setQuery('');
			setOpened(false);
			inputRef.current?.blur();
		},
		[setNodes, fitView]
	);

	// Keyboard navigation inside the results list
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (!opened || results.length === 0) return;

			if (e.key === 'ArrowDown') {
				e.preventDefault();
				setActiveIndex((prev) => (prev + 1) % results.length);
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
			} else if (e.key === 'Enter') {
				e.preventDefault();
				const selected = results[activeIndex];
				if (selected) handleSelect(selected);
			} else if (e.key === 'Escape') {
				setOpened(false);
				setQuery('');
				inputRef.current?.blur();
			}
		},
		[opened, results, activeIndex, handleSelect]
	);

	// Global keyboard shortcut: Cmd+K / Ctrl+K
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				inputRef.current?.focus();
				setOpened(true);
			}
		};
		document.addEventListener('keydown', handler);
		return () => document.removeEventListener('keydown', handler);
	}, []);

	// Reset activeIndex when results change
	useEffect(() => {
		setActiveIndex(0);
	}, [results.length]);

	const getNodeTypeLabel = (type?: string): string => {
		if (!type) return '';
		return t(`form.workflow.nodes.${type}`, { defaultValue: type });
	};

	const isMac =
		typeof navigator !== 'undefined' &&
		/Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

	return (
		<div className={`${styles.searchWrapper} nodrag nopan`}>
			<Popover
				opened={opened && query.trim().length > 0}
				onClose={() => setOpened(false)}
				position='bottom-start'
				width={320}
				shadow='md'
				radius='md'
				offset={4}
				trapFocus={false}
			>
				<Popover.Target>
					<TextInput
						ref={inputRef}
						size='xs'
						placeholder={t('form.workflow.search.placeholder')}
						leftSection={<IconSearch size={14} />}
						rightSection={
							<span className={styles.shortcutHint}>
								<span className={styles.kbd}>{isMac ? '⌘' : 'Ctrl'}</span>
								<span className={styles.kbd}>K</span>
							</span>
						}
						rightSectionWidth={isMac ? 48 : 60}
						value={query}
						onChange={(e) => {
							setQuery(e.currentTarget.value);
							if (e.currentTarget.value.trim()) {
								setOpened(true);
							}
						}}
						onFocus={() => {
							if (query.trim()) setOpened(true);
						}}
						onKeyDown={handleKeyDown}
						className={styles.searchInput}
						radius='md'
					/>
				</Popover.Target>

				<Popover.Dropdown>
					{results.length > 0 ? (
						<div className={styles.resultsList}>
							{results.map((node, index) => {
								const label =
									(node.data as { label?: string }).label ??
									getNodeTypeLabel(node.type);
								return (
									<button
										key={node.id}
										type='button'
										className={`${styles.resultItem} ${index === activeIndex ? styles.resultItemActive : ''}`}
										onClick={() => handleSelect(node)}
										onMouseEnter={() => setActiveIndex(index)}
									>
										{node.type === 'group' && (
											<IconSquaresDiagonal
												size={14}
												className={styles.resultGroupIcon}
											/>
										)}
										<Text size='sm' className={styles.resultLabel} fw={500}>
											{label}
										</Text>
										<Text size='xs' c='dimmed' className={styles.resultType}>
											{getNodeTypeLabel(node.type)}
										</Text>
									</button>
								);
							})}
						</div>
					) : (
						<div className={styles.emptyState}>
							<Text size='sm' c='dimmed'>
								{t('form.workflow.search.empty')}
							</Text>
						</div>
					)}
				</Popover.Dropdown>
			</Popover>
		</div>
	);
};

export default WorkflowNodeSearch;
