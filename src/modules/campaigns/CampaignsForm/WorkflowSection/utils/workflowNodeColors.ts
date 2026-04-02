import type { CSSProperties } from 'react';

type WorkflowNodeFamily =
	| 'gray'
	| 'red'
	| 'orange'
	| 'yellow'
	| 'green'
	| 'teal'
	| 'cyan'
	| 'blue'
	| 'indigo'
	| 'violet';

type WorkflowNodeTone = {
	accent: string;
	selectedBorder: string;
	selectedRing: string;
	headerBg: string;
	surfaceBg: string;
	borderColor: string;
};

type ParsedWorkflowLabel = {
	family: string;
	level: number;
} | null;

const FAMILY_SEQUENCE: WorkflowNodeFamily[] = [
	'blue',
	'cyan',
	'green',
	'teal',
	'indigo',
	'violet',
	'orange',
	'yellow',
	'red',
];

const FAMILY_TONES: Record<WorkflowNodeFamily, WorkflowNodeTone[]> = {
	gray: [
		{
			accent: 'var(--mantine-color-gray-7)',
			selectedBorder: 'var(--mantine-color-gray-4)',
			selectedRing: 'rgba(148, 163, 184, 0.12)',
			headerBg: 'var(--mantine-color-gray-0)',
			surfaceBg: 'var(--mantine-color-gray-0)',
			borderColor: 'var(--mantine-color-gray-2)',
		},
		{
			accent: 'var(--mantine-color-gray-7)',
			selectedBorder: 'var(--mantine-color-gray-5)',
			selectedRing: 'rgba(148, 163, 184, 0.16)',
			headerBg: 'var(--mantine-color-gray-1)',
			surfaceBg: 'var(--mantine-color-gray-1)',
			borderColor: 'var(--mantine-color-gray-3)',
		},
	],
	red: [
		{
			accent: 'var(--mantine-color-red-7)',
			selectedBorder: 'var(--mantine-color-red-4)',
			selectedRing: 'rgba(239, 68, 68, 0.12)',
			headerBg: 'var(--mantine-color-red-0)',
			surfaceBg: 'var(--mantine-color-red-0)',
			borderColor: 'var(--mantine-color-red-2)',
		},
		{
			accent: 'var(--mantine-color-red-7)',
			selectedBorder: 'var(--mantine-color-red-5)',
			selectedRing: 'rgba(239, 68, 68, 0.16)',
			headerBg: 'var(--mantine-color-red-1)',
			surfaceBg: 'var(--mantine-color-red-1)',
			borderColor: 'var(--mantine-color-red-3)',
		},
		{
			accent: 'var(--mantine-color-red-8)',
			selectedBorder: 'var(--mantine-color-red-6)',
			selectedRing: 'rgba(239, 68, 68, 0.2)',
			headerBg: 'var(--mantine-color-red-2)',
			surfaceBg: 'var(--mantine-color-red-2)',
			borderColor: 'var(--mantine-color-red-4)',
		},
	],
	orange: [
		{
			accent: 'var(--mantine-color-orange-7)',
			selectedBorder: 'var(--mantine-color-orange-4)',
			selectedRing: 'rgba(249, 115, 22, 0.12)',
			headerBg: 'var(--mantine-color-orange-0)',
			surfaceBg: 'var(--mantine-color-orange-0)',
			borderColor: 'var(--mantine-color-orange-2)',
		},
		{
			accent: 'var(--mantine-color-orange-7)',
			selectedBorder: 'var(--mantine-color-orange-5)',
			selectedRing: 'rgba(249, 115, 22, 0.16)',
			headerBg: 'var(--mantine-color-orange-1)',
			surfaceBg: 'var(--mantine-color-orange-1)',
			borderColor: 'var(--mantine-color-orange-3)',
		},
		{
			accent: 'var(--mantine-color-orange-8)',
			selectedBorder: 'var(--mantine-color-orange-6)',
			selectedRing: 'rgba(249, 115, 22, 0.2)',
			headerBg: 'var(--mantine-color-orange-2)',
			surfaceBg: 'var(--mantine-color-orange-2)',
			borderColor: 'var(--mantine-color-orange-4)',
		},
	],
	yellow: [
		{
			accent: 'var(--mantine-color-yellow-7)',
			selectedBorder: 'var(--mantine-color-yellow-4)',
			selectedRing: 'rgba(234, 179, 8, 0.12)',
			headerBg: 'var(--mantine-color-yellow-0)',
			surfaceBg: 'var(--mantine-color-yellow-0)',
			borderColor: 'var(--mantine-color-yellow-2)',
		},
		{
			accent: 'var(--mantine-color-yellow-7)',
			selectedBorder: 'var(--mantine-color-yellow-5)',
			selectedRing: 'rgba(234, 179, 8, 0.16)',
			headerBg: 'var(--mantine-color-yellow-1)',
			surfaceBg: 'var(--mantine-color-yellow-1)',
			borderColor: 'var(--mantine-color-yellow-3)',
		},
		{
			accent: 'var(--mantine-color-yellow-8)',
			selectedBorder: 'var(--mantine-color-yellow-6)',
			selectedRing: 'rgba(234, 179, 8, 0.2)',
			headerBg: 'var(--mantine-color-yellow-2)',
			surfaceBg: 'var(--mantine-color-yellow-2)',
			borderColor: 'var(--mantine-color-yellow-4)',
		},
	],
	green: [
		{
			accent: 'var(--mantine-color-green-7)',
			selectedBorder: 'var(--mantine-color-green-4)',
			selectedRing: 'rgba(34, 197, 94, 0.12)',
			headerBg: 'var(--mantine-color-green-0)',
			surfaceBg: 'var(--mantine-color-green-0)',
			borderColor: 'var(--mantine-color-green-2)',
		},
		{
			accent: 'var(--mantine-color-green-7)',
			selectedBorder: 'var(--mantine-color-green-5)',
			selectedRing: 'rgba(34, 197, 94, 0.16)',
			headerBg: 'var(--mantine-color-green-1)',
			surfaceBg: 'var(--mantine-color-green-1)',
			borderColor: 'var(--mantine-color-green-3)',
		},
		{
			accent: 'var(--mantine-color-green-8)',
			selectedBorder: 'var(--mantine-color-green-6)',
			selectedRing: 'rgba(34, 197, 94, 0.2)',
			headerBg: 'var(--mantine-color-green-2)',
			surfaceBg: 'var(--mantine-color-green-2)',
			borderColor: 'var(--mantine-color-green-4)',
		},
	],
	teal: [
		{
			accent: 'var(--mantine-color-teal-7)',
			selectedBorder: 'var(--mantine-color-teal-4)',
			selectedRing: 'rgba(20, 184, 166, 0.12)',
			headerBg: 'var(--mantine-color-teal-0)',
			surfaceBg: 'var(--mantine-color-teal-0)',
			borderColor: 'var(--mantine-color-teal-2)',
		},
		{
			accent: 'var(--mantine-color-teal-7)',
			selectedBorder: 'var(--mantine-color-teal-5)',
			selectedRing: 'rgba(20, 184, 166, 0.16)',
			headerBg: 'var(--mantine-color-teal-1)',
			surfaceBg: 'var(--mantine-color-teal-1)',
			borderColor: 'var(--mantine-color-teal-3)',
		},
		{
			accent: 'var(--mantine-color-teal-8)',
			selectedBorder: 'var(--mantine-color-teal-6)',
			selectedRing: 'rgba(20, 184, 166, 0.2)',
			headerBg: 'var(--mantine-color-teal-2)',
			surfaceBg: 'var(--mantine-color-teal-2)',
			borderColor: 'var(--mantine-color-teal-4)',
		},
	],
	cyan: [
		{
			accent: 'var(--mantine-color-cyan-7)',
			selectedBorder: 'var(--mantine-color-cyan-4)',
			selectedRing: 'rgba(34, 211, 238, 0.12)',
			headerBg: 'var(--mantine-color-cyan-0)',
			surfaceBg: 'var(--mantine-color-cyan-0)',
			borderColor: 'var(--mantine-color-cyan-2)',
		},
		{
			accent: 'var(--mantine-color-cyan-7)',
			selectedBorder: 'var(--mantine-color-cyan-5)',
			selectedRing: 'rgba(34, 211, 238, 0.16)',
			headerBg: 'var(--mantine-color-cyan-1)',
			surfaceBg: 'var(--mantine-color-cyan-1)',
			borderColor: 'var(--mantine-color-cyan-3)',
		},
		{
			accent: 'var(--mantine-color-cyan-8)',
			selectedBorder: 'var(--mantine-color-cyan-6)',
			selectedRing: 'rgba(34, 211, 238, 0.2)',
			headerBg: 'var(--mantine-color-cyan-2)',
			surfaceBg: 'var(--mantine-color-cyan-2)',
			borderColor: 'var(--mantine-color-cyan-4)',
		},
	],
	blue: [
		{
			accent: 'var(--mantine-color-blue-7)',
			selectedBorder: 'var(--mantine-color-blue-4)',
			selectedRing: 'rgba(59, 130, 246, 0.12)',
			headerBg: 'var(--mantine-color-blue-0)',
			surfaceBg: 'var(--mantine-color-blue-0)',
			borderColor: 'var(--mantine-color-blue-2)',
		},
		{
			accent: 'var(--mantine-color-blue-7)',
			selectedBorder: 'var(--mantine-color-blue-5)',
			selectedRing: 'rgba(59, 130, 246, 0.16)',
			headerBg: 'var(--mantine-color-blue-1)',
			surfaceBg: 'var(--mantine-color-blue-1)',
			borderColor: 'var(--mantine-color-blue-3)',
		},
		{
			accent: 'var(--mantine-color-blue-8)',
			selectedBorder: 'var(--mantine-color-blue-6)',
			selectedRing: 'rgba(59, 130, 246, 0.2)',
			headerBg: 'var(--mantine-color-blue-2)',
			surfaceBg: 'var(--mantine-color-blue-2)',
			borderColor: 'var(--mantine-color-blue-4)',
		},
	],
	indigo: [
		{
			accent: 'var(--mantine-color-indigo-7)',
			selectedBorder: 'var(--mantine-color-indigo-4)',
			selectedRing: 'rgba(99, 102, 241, 0.12)',
			headerBg: 'var(--mantine-color-indigo-0)',
			surfaceBg: 'var(--mantine-color-indigo-0)',
			borderColor: 'var(--mantine-color-indigo-2)',
		},
		{
			accent: 'var(--mantine-color-indigo-7)',
			selectedBorder: 'var(--mantine-color-indigo-5)',
			selectedRing: 'rgba(99, 102, 241, 0.16)',
			headerBg: 'var(--mantine-color-indigo-1)',
			surfaceBg: 'var(--mantine-color-indigo-1)',
			borderColor: 'var(--mantine-color-indigo-3)',
		},
		{
			accent: 'var(--mantine-color-indigo-8)',
			selectedBorder: 'var(--mantine-color-indigo-6)',
			selectedRing: 'rgba(99, 102, 241, 0.2)',
			headerBg: 'var(--mantine-color-indigo-2)',
			surfaceBg: 'var(--mantine-color-indigo-2)',
			borderColor: 'var(--mantine-color-indigo-4)',
		},
	],
	violet: [
		{
			accent: 'var(--mantine-color-violet-7)',
			selectedBorder: 'var(--mantine-color-violet-4)',
			selectedRing: 'rgba(139, 92, 246, 0.12)',
			headerBg: 'var(--mantine-color-violet-0)',
			surfaceBg: 'var(--mantine-color-violet-0)',
			borderColor: 'var(--mantine-color-violet-2)',
		},
		{
			accent: 'var(--mantine-color-violet-7)',
			selectedBorder: 'var(--mantine-color-violet-5)',
			selectedRing: 'rgba(139, 92, 246, 0.16)',
			headerBg: 'var(--mantine-color-violet-1)',
			surfaceBg: 'var(--mantine-color-violet-1)',
			borderColor: 'var(--mantine-color-violet-3)',
		},
		{
			accent: 'var(--mantine-color-violet-8)',
			selectedBorder: 'var(--mantine-color-violet-6)',
			selectedRing: 'rgba(139, 92, 246, 0.2)',
			headerBg: 'var(--mantine-color-violet-2)',
			surfaceBg: 'var(--mantine-color-violet-2)',
			borderColor: 'var(--mantine-color-violet-4)',
		},
	],
};

const normalizeLabel = (label?: string): string => {
	if (!label) return '';
	const trimmed = label.trim();
	const prefix = trimmed.split(/[-_\s]/)[0] ?? '';
	return prefix.replace(/^[^a-zA-Z]+/, '');
};

const parseWorkflowLabel = (label?: string): ParsedWorkflowLabel => {
	const prefix = normalizeLabel(label);
	const match = /^([A-Za-z])(\d*(?:\.\d+)*)?$/.exec(prefix);
	if (!match) return null;

	const family = match[1]?.toUpperCase();
	if (!family) return null;

	const numericPart = match[2] ?? '';
	const level = numericPart ? numericPart.split('.').filter(Boolean).length : 0;

	return { family, level };
};

const getFamilyForLetter = (letter: string): WorkflowNodeFamily | 'gray' => {
	const index = letter.charCodeAt(0) - 65;
	return FAMILY_SEQUENCE[index % FAMILY_SEQUENCE.length] ?? 'gray';
};

const getToneForFamilyAndLevel = (
	family: WorkflowNodeFamily,
	level: number
): WorkflowNodeTone => {
	const tones = FAMILY_TONES[family];
	return tones[Math.min(level, tones.length - 1)] ?? tones[0];
};

export const getWorkflowNodeToneStyle = (label?: string): CSSProperties => {
	const parsed = parseWorkflowLabel(label);
	if (!parsed) {
		const neutral = FAMILY_TONES.gray[0];
		return {
			'--workflow-node-accent': neutral.accent,
			'--workflow-node-selected-border': neutral.selectedBorder,
			'--workflow-node-selected-ring': neutral.selectedRing,
			'--workflow-node-header-bg': neutral.headerBg,
			'--workflow-node-surface-selected': neutral.surfaceBg,
			backgroundColor: neutral.surfaceBg,
			borderColor: neutral.borderColor,
		} as CSSProperties;
	}

	const family = getFamilyForLetter(parsed.family);
	const resolvedFamily = family === 'gray' ? 'gray' : family;
	const tone = getToneForFamilyAndLevel(resolvedFamily, parsed.level);

	return {
		'--workflow-node-accent': tone.accent,
		'--workflow-node-selected-border': tone.selectedBorder,
		'--workflow-node-selected-ring': tone.selectedRing,
		'--workflow-node-header-bg': tone.headerBg,
		'--workflow-node-surface-selected': tone.surfaceBg,
		backgroundColor: tone.surfaceBg,
		borderColor: tone.borderColor,
	} as CSSProperties;
};
