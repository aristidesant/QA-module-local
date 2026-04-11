import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { useComputedColorScheme } from '@mantine/core';
import type { NodeStyle } from '~/models/CampaignsModel';

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
	textColor: string;
	subtextColor: string;
	panelBg: string;
	panelBorder: string;
	chipBg: string;
	chipBorder: string;
	chipText: string;
	iconBg: string;
	iconBorder: string;
};

export type WorkflowColorScheme = 'light' | 'dark';

export type WorkflowShellStyle = CSSProperties & {
	'--workflow-shell-surface'?: string;
	'--workflow-shell-panel'?: string;
	'--workflow-shell-panel-muted'?: string;
	'--workflow-shell-panel-elevated'?: string;
	'--workflow-shell-border'?: string;
	'--workflow-shell-border-strong'?: string;
	'--workflow-shell-border-soft'?: string;
	'--workflow-shell-text'?: string;
	'--workflow-shell-text-muted'?: string;
	'--workflow-shell-control-bg'?: string;
	'--workflow-shell-control-border'?: string;
	'--workflow-shell-control-text'?: string;
	'--workflow-shell-grid-color'?: string;
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
			textColor: 'var(--mantine-color-gray-9)',
			subtextColor: 'var(--mantine-color-gray-6)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-gray-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-gray-2)',
			chipText: 'var(--mantine-color-gray-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-gray-2)',
		},
		{
			accent: 'var(--mantine-color-gray-7)',
			selectedBorder: 'var(--mantine-color-gray-5)',
			selectedRing: 'rgba(148, 163, 184, 0.16)',
			headerBg: 'var(--mantine-color-gray-1)',
			surfaceBg: 'var(--mantine-color-gray-1)',
			borderColor: 'var(--mantine-color-gray-3)',
			textColor: 'var(--mantine-color-gray-9)',
			subtextColor: 'var(--mantine-color-gray-6)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-gray-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-gray-2)',
			chipText: 'var(--mantine-color-gray-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-gray-2)',
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
			textColor: 'var(--mantine-color-red-9)',
			subtextColor: 'var(--mantine-color-red-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-red-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-red-2)',
			chipText: 'var(--mantine-color-red-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-red-2)',
		},
		{
			accent: 'var(--mantine-color-red-7)',
			selectedBorder: 'var(--mantine-color-red-5)',
			selectedRing: 'rgba(239, 68, 68, 0.16)',
			headerBg: 'var(--mantine-color-red-1)',
			surfaceBg: 'var(--mantine-color-red-1)',
			borderColor: 'var(--mantine-color-red-3)',
			textColor: 'var(--mantine-color-red-9)',
			subtextColor: 'var(--mantine-color-red-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-red-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-red-2)',
			chipText: 'var(--mantine-color-red-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-red-2)',
		},
		{
			accent: 'var(--mantine-color-red-8)',
			selectedBorder: 'var(--mantine-color-red-6)',
			selectedRing: 'rgba(239, 68, 68, 0.2)',
			headerBg: 'var(--mantine-color-red-2)',
			surfaceBg: 'var(--mantine-color-red-2)',
			borderColor: 'var(--mantine-color-red-4)',
			textColor: 'var(--mantine-color-red-9)',
			subtextColor: 'var(--mantine-color-red-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-red-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-red-2)',
			chipText: 'var(--mantine-color-red-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-red-2)',
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
			textColor: 'var(--mantine-color-orange-9)',
			subtextColor: 'var(--mantine-color-orange-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-orange-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-orange-2)',
			chipText: 'var(--mantine-color-orange-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-orange-2)',
		},
		{
			accent: 'var(--mantine-color-orange-7)',
			selectedBorder: 'var(--mantine-color-orange-5)',
			selectedRing: 'rgba(249, 115, 22, 0.16)',
			headerBg: 'var(--mantine-color-orange-1)',
			surfaceBg: 'var(--mantine-color-orange-1)',
			borderColor: 'var(--mantine-color-orange-3)',
			textColor: 'var(--mantine-color-orange-9)',
			subtextColor: 'var(--mantine-color-orange-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-orange-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-orange-2)',
			chipText: 'var(--mantine-color-orange-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-orange-2)',
		},
		{
			accent: 'var(--mantine-color-orange-8)',
			selectedBorder: 'var(--mantine-color-orange-6)',
			selectedRing: 'rgba(249, 115, 22, 0.2)',
			headerBg: 'var(--mantine-color-orange-2)',
			surfaceBg: 'var(--mantine-color-orange-2)',
			borderColor: 'var(--mantine-color-orange-4)',
			textColor: 'var(--mantine-color-orange-9)',
			subtextColor: 'var(--mantine-color-orange-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-orange-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-orange-2)',
			chipText: 'var(--mantine-color-orange-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-orange-2)',
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
			textColor: 'var(--mantine-color-yellow-9)',
			subtextColor: 'var(--mantine-color-yellow-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-yellow-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-yellow-2)',
			chipText: 'var(--mantine-color-yellow-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-yellow-2)',
		},
		{
			accent: 'var(--mantine-color-yellow-7)',
			selectedBorder: 'var(--mantine-color-yellow-5)',
			selectedRing: 'rgba(234, 179, 8, 0.16)',
			headerBg: 'var(--mantine-color-yellow-1)',
			surfaceBg: 'var(--mantine-color-yellow-1)',
			borderColor: 'var(--mantine-color-yellow-3)',
			textColor: 'var(--mantine-color-yellow-9)',
			subtextColor: 'var(--mantine-color-yellow-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-yellow-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-yellow-2)',
			chipText: 'var(--mantine-color-yellow-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-yellow-2)',
		},
		{
			accent: 'var(--mantine-color-yellow-8)',
			selectedBorder: 'var(--mantine-color-yellow-6)',
			selectedRing: 'rgba(234, 179, 8, 0.2)',
			headerBg: 'var(--mantine-color-yellow-2)',
			surfaceBg: 'var(--mantine-color-yellow-2)',
			borderColor: 'var(--mantine-color-yellow-4)',
			textColor: 'var(--mantine-color-yellow-9)',
			subtextColor: 'var(--mantine-color-yellow-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-yellow-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-yellow-2)',
			chipText: 'var(--mantine-color-yellow-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-yellow-2)',
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
			textColor: 'var(--mantine-color-green-9)',
			subtextColor: 'var(--mantine-color-green-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-green-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-green-2)',
			chipText: 'var(--mantine-color-green-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-green-2)',
		},
		{
			accent: 'var(--mantine-color-green-7)',
			selectedBorder: 'var(--mantine-color-green-5)',
			selectedRing: 'rgba(34, 197, 94, 0.16)',
			headerBg: 'var(--mantine-color-green-1)',
			surfaceBg: 'var(--mantine-color-green-1)',
			borderColor: 'var(--mantine-color-green-3)',
			textColor: 'var(--mantine-color-green-9)',
			subtextColor: 'var(--mantine-color-green-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-green-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-green-2)',
			chipText: 'var(--mantine-color-green-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-green-2)',
		},
		{
			accent: 'var(--mantine-color-green-8)',
			selectedBorder: 'var(--mantine-color-green-6)',
			selectedRing: 'rgba(34, 197, 94, 0.2)',
			headerBg: 'var(--mantine-color-green-2)',
			surfaceBg: 'var(--mantine-color-green-2)',
			borderColor: 'var(--mantine-color-green-4)',
			textColor: 'var(--mantine-color-green-9)',
			subtextColor: 'var(--mantine-color-green-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-green-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-green-2)',
			chipText: 'var(--mantine-color-green-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-green-2)',
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
			textColor: 'var(--mantine-color-teal-9)',
			subtextColor: 'var(--mantine-color-teal-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-teal-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-teal-2)',
			chipText: 'var(--mantine-color-teal-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-teal-2)',
		},
		{
			accent: 'var(--mantine-color-teal-7)',
			selectedBorder: 'var(--mantine-color-teal-5)',
			selectedRing: 'rgba(20, 184, 166, 0.16)',
			headerBg: 'var(--mantine-color-teal-1)',
			surfaceBg: 'var(--mantine-color-teal-1)',
			borderColor: 'var(--mantine-color-teal-3)',
			textColor: 'var(--mantine-color-teal-9)',
			subtextColor: 'var(--mantine-color-teal-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-teal-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-teal-2)',
			chipText: 'var(--mantine-color-teal-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-teal-2)',
		},
		{
			accent: 'var(--mantine-color-teal-8)',
			selectedBorder: 'var(--mantine-color-teal-6)',
			selectedRing: 'rgba(20, 184, 166, 0.2)',
			headerBg: 'var(--mantine-color-teal-2)',
			surfaceBg: 'var(--mantine-color-teal-2)',
			borderColor: 'var(--mantine-color-teal-4)',
			textColor: 'var(--mantine-color-teal-9)',
			subtextColor: 'var(--mantine-color-teal-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-teal-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-teal-2)',
			chipText: 'var(--mantine-color-teal-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-teal-2)',
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
			textColor: 'var(--mantine-color-cyan-9)',
			subtextColor: 'var(--mantine-color-cyan-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-cyan-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-cyan-2)',
			chipText: 'var(--mantine-color-cyan-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-cyan-2)',
		},
		{
			accent: 'var(--mantine-color-cyan-7)',
			selectedBorder: 'var(--mantine-color-cyan-5)',
			selectedRing: 'rgba(34, 211, 238, 0.16)',
			headerBg: 'var(--mantine-color-cyan-1)',
			surfaceBg: 'var(--mantine-color-cyan-1)',
			borderColor: 'var(--mantine-color-cyan-3)',
			textColor: 'var(--mantine-color-cyan-9)',
			subtextColor: 'var(--mantine-color-cyan-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-cyan-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-cyan-2)',
			chipText: 'var(--mantine-color-cyan-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-cyan-2)',
		},
		{
			accent: 'var(--mantine-color-cyan-8)',
			selectedBorder: 'var(--mantine-color-cyan-6)',
			selectedRing: 'rgba(34, 211, 238, 0.2)',
			headerBg: 'var(--mantine-color-cyan-2)',
			surfaceBg: 'var(--mantine-color-cyan-2)',
			borderColor: 'var(--mantine-color-cyan-4)',
			textColor: 'var(--mantine-color-cyan-9)',
			subtextColor: 'var(--mantine-color-cyan-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-cyan-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-cyan-2)',
			chipText: 'var(--mantine-color-cyan-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-cyan-2)',
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
			textColor: 'var(--mantine-color-blue-9)',
			subtextColor: 'var(--mantine-color-blue-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-blue-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-blue-2)',
			chipText: 'var(--mantine-color-blue-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-blue-2)',
		},
		{
			accent: 'var(--mantine-color-blue-7)',
			selectedBorder: 'var(--mantine-color-blue-5)',
			selectedRing: 'rgba(59, 130, 246, 0.16)',
			headerBg: 'var(--mantine-color-blue-1)',
			surfaceBg: 'var(--mantine-color-blue-1)',
			borderColor: 'var(--mantine-color-blue-3)',
			textColor: 'var(--mantine-color-blue-9)',
			subtextColor: 'var(--mantine-color-blue-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-blue-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-blue-2)',
			chipText: 'var(--mantine-color-blue-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-blue-2)',
		},
		{
			accent: 'var(--mantine-color-blue-8)',
			selectedBorder: 'var(--mantine-color-blue-6)',
			selectedRing: 'rgba(59, 130, 246, 0.2)',
			headerBg: 'var(--mantine-color-blue-2)',
			surfaceBg: 'var(--mantine-color-blue-2)',
			borderColor: 'var(--mantine-color-blue-4)',
			textColor: 'var(--mantine-color-blue-9)',
			subtextColor: 'var(--mantine-color-blue-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-blue-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-blue-2)',
			chipText: 'var(--mantine-color-blue-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-blue-2)',
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
			textColor: 'var(--mantine-color-indigo-9)',
			subtextColor: 'var(--mantine-color-indigo-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-indigo-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-indigo-2)',
			chipText: 'var(--mantine-color-indigo-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-indigo-2)',
		},
		{
			accent: 'var(--mantine-color-indigo-7)',
			selectedBorder: 'var(--mantine-color-indigo-5)',
			selectedRing: 'rgba(99, 102, 241, 0.16)',
			headerBg: 'var(--mantine-color-indigo-1)',
			surfaceBg: 'var(--mantine-color-indigo-1)',
			borderColor: 'var(--mantine-color-indigo-3)',
			textColor: 'var(--mantine-color-indigo-9)',
			subtextColor: 'var(--mantine-color-indigo-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-indigo-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-indigo-2)',
			chipText: 'var(--mantine-color-indigo-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-indigo-2)',
		},
		{
			accent: 'var(--mantine-color-indigo-8)',
			selectedBorder: 'var(--mantine-color-indigo-6)',
			selectedRing: 'rgba(99, 102, 241, 0.2)',
			headerBg: 'var(--mantine-color-indigo-2)',
			surfaceBg: 'var(--mantine-color-indigo-2)',
			borderColor: 'var(--mantine-color-indigo-4)',
			textColor: 'var(--mantine-color-indigo-9)',
			subtextColor: 'var(--mantine-color-indigo-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-indigo-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-indigo-2)',
			chipText: 'var(--mantine-color-indigo-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-indigo-2)',
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
			textColor: 'var(--mantine-color-violet-9)',
			subtextColor: 'var(--mantine-color-violet-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-violet-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-violet-2)',
			chipText: 'var(--mantine-color-violet-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-violet-2)',
		},
		{
			accent: 'var(--mantine-color-violet-7)',
			selectedBorder: 'var(--mantine-color-violet-5)',
			selectedRing: 'rgba(139, 92, 246, 0.16)',
			headerBg: 'var(--mantine-color-violet-1)',
			surfaceBg: 'var(--mantine-color-violet-1)',
			borderColor: 'var(--mantine-color-violet-3)',
			textColor: 'var(--mantine-color-violet-9)',
			subtextColor: 'var(--mantine-color-violet-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-violet-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-violet-2)',
			chipText: 'var(--mantine-color-violet-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-violet-2)',
		},
		{
			accent: 'var(--mantine-color-violet-8)',
			selectedBorder: 'var(--mantine-color-violet-6)',
			selectedRing: 'rgba(139, 92, 246, 0.2)',
			headerBg: 'var(--mantine-color-violet-2)',
			surfaceBg: 'var(--mantine-color-violet-2)',
			borderColor: 'var(--mantine-color-violet-4)',
			textColor: 'var(--mantine-color-violet-9)',
			subtextColor: 'var(--mantine-color-violet-7)',
			panelBg: 'var(--mantine-color-white)',
			panelBorder: 'var(--mantine-color-violet-2)',
			chipBg: 'var(--mantine-color-white)',
			chipBorder: 'var(--mantine-color-violet-2)',
			chipText: 'var(--mantine-color-violet-8)',
			iconBg: 'var(--mantine-color-white)',
			iconBorder: 'var(--mantine-color-violet-2)',
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

const buildDarkTone = (
	family: WorkflowNodeFamily,
	level: number
): WorkflowNodeTone => {
	const levelIndex = Math.min(level, 2);
	const surfaceMix = [8, 10, 12][levelIndex] ?? 8;
	const headerMix = [12, 14, 16][levelIndex] ?? 12;
	const borderMix = [18, 22, 26][levelIndex] ?? 18;
	const selectedRingMix = [18, 20, 22][levelIndex] ?? 18;

	if (family === 'gray') {
		return {
			accent: 'var(--mantine-color-dark-0)',
			selectedBorder: 'var(--mantine-color-dark-4)',
			selectedRing: 'rgba(148, 163, 184, 0.16)',
			headerBg: 'var(--mantine-color-dark-6)',
			surfaceBg: 'var(--mantine-color-dark-7)',
			borderColor: 'var(--mantine-color-dark-5)',
			textColor: 'var(--mantine-color-dark-0)',
			subtextColor: 'var(--mantine-color-dark-2)',
			panelBg: 'var(--mantine-color-dark-6)',
			panelBorder: 'var(--mantine-color-dark-5)',
			chipBg: 'var(--mantine-color-dark-6)',
			chipBorder: 'var(--mantine-color-dark-4)',
			chipText: 'var(--mantine-color-dark-1)',
			iconBg: 'var(--mantine-color-dark-6)',
			iconBorder: 'var(--mantine-color-dark-4)',
		};
	}

	return {
		accent: `var(--mantine-color-${family}-4)`,
		selectedBorder: `var(--mantine-color-${family}-5)`,
		selectedRing: `color-mix(in srgb, var(--mantine-color-${family}-5) ${selectedRingMix}%, transparent)`,
		headerBg: `color-mix(in srgb, var(--mantine-color-${family}-9) ${headerMix}%, var(--mantine-color-dark-7))`,
		surfaceBg: `color-mix(in srgb, var(--mantine-color-${family}-9) ${surfaceMix}%, var(--mantine-color-dark-7))`,
		borderColor: `color-mix(in srgb, var(--mantine-color-${family}-7) ${borderMix}%, var(--mantine-color-dark-5))`,
		textColor: 'var(--mantine-color-dark-0)',
		subtextColor: 'var(--mantine-color-dark-2)',
		panelBg: `color-mix(in srgb, var(--mantine-color-${family}-9) 10%, var(--mantine-color-dark-6))`,
		panelBorder: `color-mix(in srgb, var(--mantine-color-${family}-6) 16%, var(--mantine-color-dark-5))`,
		chipBg: 'var(--mantine-color-dark-6)',
		chipBorder: 'var(--mantine-color-dark-4)',
		chipText: 'var(--mantine-color-dark-1)',
		iconBg: 'var(--mantine-color-dark-6)',
		iconBorder: 'var(--mantine-color-dark-4)',
	};
};

/**
 * Convert a hex colour to an RGBA string with the given alpha.
 */
const hexToRgba = (hex: string, alpha: number): string => {
	const clean = hex.replace('#', '');
	const full =
		clean.length === 3
			? clean
					.split('')
					.map((c) => c + c)
					.join('')
			: clean;
	const r = parseInt(full.slice(0, 2), 16);
	const g = parseInt(full.slice(2, 4), 16);
	const b = parseInt(full.slice(4, 6), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Compute WCAG-based relative luminance for a hex colour.
 * Returns a value between 0 (black) and 1 (white).
 */
const getRelativeLuminance = (hex: string): number => {
	const clean = hex.replace('#', '');
	const full =
		clean.length === 3
			? clean
					.split('')
					.map((c) => c + c)
					.join('')
			: clean;
	const toLinear = (c: number) =>
		c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	const r = toLinear(parseInt(full.slice(0, 2), 16) / 255);
	const g = toLinear(parseInt(full.slice(2, 4), 16) / 255);
	const b = toLinear(parseInt(full.slice(4, 6), 16) / 255);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Return the best-contrasting text colour (#ffffff or #1a1a1a) for a given
 * background hex colour, using the WCAG relative luminance threshold.
 */
const getContrastTextColor = (hex: string): string =>
	getRelativeLuminance(hex) > 0.179 ? '#1a1a1a' : '#ffffff';

/**
 * Darken a hex colour by the given amount (0–1).
 */
const darkenHex = (hex: string, amount: number): string => {
	const clean = hex.replace('#', '');
	const full =
		clean.length === 3
			? clean
					.split('')
					.map((c) => c + c)
					.join('')
			: clean;
	const r = Math.max(
		0,
		Math.round(parseInt(full.slice(0, 2), 16) * (1 - amount))
	);
	const g = Math.max(
		0,
		Math.round(parseInt(full.slice(2, 4), 16) * (1 - amount))
	);
	const b = Math.max(
		0,
		Math.round(parseInt(full.slice(4, 6), 16) * (1 - amount))
	);
	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

/**
 * Build CSS variables from a custom NodeStyle (user-chosen colour).
 * Derives border, ring, header bg, etc. from the background colour automatically.
 */
const buildNodeStyleFromCustomColor = (nodeStyle: NodeStyle): CSSProperties => {
	const bg = nodeStyle.backgroundColor ?? '#adb5bd';
	const border = nodeStyle.borderColor ?? darkenHex(bg, 0.25);
	const accent = nodeStyle.textColor ?? darkenHex(bg, 0.5);
	const isLight = getRelativeLuminance(bg) > 0.179;
	const headerText = getContrastTextColor(bg);
	const headerSubtext = isLight
		? 'rgba(0, 0, 0, 0.55)'
		: 'rgba(255, 255, 255, 0.72)';

	return {
		'--workflow-node-accent': accent,
		'--workflow-node-header-text': headerText,
		'--workflow-node-header-subtext': headerSubtext,
		'--workflow-node-surface': bg,
		'--workflow-node-surface-selected': bg,
		'--workflow-node-selected-border': border,
		'--workflow-node-selected-ring': hexToRgba(bg, 0.18),
		'--workflow-node-header-bg': bg,
		'--workflow-node-body-bg': bg,
		'--workflow-node-panel-bg': bg,
		'--workflow-node-panel-border': border,
		'--workflow-node-chip-bg': bg,
		'--workflow-node-chip-border': border,
		'--workflow-node-chip-text': headerText,
		'--workflow-node-icon-bg': bg,
		'--workflow-node-icon-border': border,
		backgroundColor: bg,
		borderColor: border,
	} as CSSProperties;
};

export const getWorkflowNodeToneStyle = (
	label?: string,
	nodeStyle?: NodeStyle,
	colorScheme: WorkflowColorScheme = 'light'
): CSSProperties => {
	// When a persisted NodeStyle is provided, use it directly
	if (nodeStyle?.backgroundColor) {
		return buildNodeStyleFromCustomColor(nodeStyle);
	}

	const parsed = parseWorkflowLabel(label);
	if (!parsed) {
		const neutral =
			colorScheme === 'dark' ? buildDarkTone('gray', 0) : FAMILY_TONES.gray[0];
		return {
			'--workflow-node-accent': neutral.accent,
			'--workflow-node-selected-border': neutral.selectedBorder,
			'--workflow-node-selected-ring': neutral.selectedRing,
			'--workflow-node-header-bg': neutral.headerBg,
			'--workflow-node-surface-selected': neutral.surfaceBg,
			'--workflow-node-surface': neutral.surfaceBg,
			'--workflow-node-body-bg': neutral.panelBg,
			'--workflow-node-panel-bg': neutral.panelBg,
			'--workflow-node-panel-border': neutral.panelBorder,
			'--workflow-node-chip-bg': neutral.chipBg,
			'--workflow-node-chip-border': neutral.chipBorder,
			'--workflow-node-chip-text': neutral.chipText,
			'--workflow-node-icon-bg': neutral.iconBg,
			'--workflow-node-icon-border': neutral.iconBorder,
			'--workflow-node-header-text': neutral.textColor,
			'--workflow-node-header-subtext': neutral.subtextColor,
			backgroundColor: neutral.surfaceBg,
			borderColor: neutral.borderColor,
		} as CSSProperties;
	}

	const family = getFamilyForLetter(parsed.family);
	const resolvedFamily = family === 'gray' ? 'gray' : family;
	const tone =
		colorScheme === 'dark'
			? buildDarkTone(resolvedFamily, parsed.level)
			: getToneForFamilyAndLevel(resolvedFamily, parsed.level);

	return {
		'--workflow-node-accent': tone.accent,
		'--workflow-node-selected-border': tone.selectedBorder,
		'--workflow-node-selected-ring': tone.selectedRing,
		'--workflow-node-header-bg': tone.headerBg,
		'--workflow-node-surface-selected': tone.surfaceBg,
		'--workflow-node-surface': tone.surfaceBg,
		'--workflow-node-body-bg': tone.panelBg,
		'--workflow-node-panel-bg': tone.panelBg,
		'--workflow-node-panel-border': tone.panelBorder,
		'--workflow-node-chip-bg': tone.chipBg,
		'--workflow-node-chip-border': tone.chipBorder,
		'--workflow-node-chip-text': tone.chipText,
		'--workflow-node-icon-bg': tone.iconBg,
		'--workflow-node-icon-border': tone.iconBorder,
		'--workflow-node-header-text': tone.textColor,
		'--workflow-node-header-subtext': tone.subtextColor,
		backgroundColor: tone.surfaceBg,
		borderColor: tone.borderColor,
	} as CSSProperties;
};

export const getWorkflowShellTokens = (
	colorScheme: WorkflowColorScheme = 'light'
): WorkflowShellStyle => {
	if (colorScheme === 'dark') {
		return {
			'--workflow-shell-surface': 'var(--mantine-color-dark-8)',
			'--workflow-shell-panel': 'var(--mantine-color-dark-7)',
			'--workflow-shell-panel-muted': 'var(--mantine-color-dark-6)',
			'--workflow-shell-panel-elevated': 'var(--mantine-color-dark-6)',
			'--workflow-shell-border': 'var(--mantine-color-dark-5)',
			'--workflow-shell-border-strong': 'var(--mantine-color-dark-4)',
			'--workflow-shell-border-soft': 'var(--mantine-color-dark-6)',
			'--workflow-shell-text': 'var(--mantine-color-dark-0)',
			'--workflow-shell-text-muted': 'var(--mantine-color-dark-2)',
			'--workflow-shell-control-bg': 'var(--mantine-color-dark-6)',
			'--workflow-shell-control-border': 'var(--mantine-color-dark-5)',
			'--workflow-shell-control-text': 'var(--mantine-color-dark-1)',
			'--workflow-shell-grid-color': 'var(--mantine-color-dark-4)',
		};
	}

	return {
		'--workflow-shell-surface': 'var(--mantine-color-white)',
		'--workflow-shell-panel': 'var(--mantine-color-white)',
		'--workflow-shell-panel-muted': 'var(--mantine-color-gray-0)',
		'--workflow-shell-panel-elevated': 'var(--mantine-color-white)',
		'--workflow-shell-border': 'var(--mantine-color-gray-3)',
		'--workflow-shell-border-strong': 'var(--mantine-color-gray-4)',
		'--workflow-shell-border-soft': 'var(--mantine-color-gray-2)',
		'--workflow-shell-text': 'var(--mantine-color-gray-9)',
		'--workflow-shell-text-muted': 'var(--mantine-color-gray-6)',
		'--workflow-shell-control-bg': 'var(--mantine-color-white)',
		'--workflow-shell-control-border': 'var(--mantine-color-gray-3)',
		'--workflow-shell-control-text': 'var(--mantine-color-gray-7)',
		'--workflow-shell-grid-color': 'var(--mantine-color-gray-4)',
	};
};

export const useWorkflowNodeToneStyle = (
	label?: string,
	nodeStyle?: NodeStyle
): CSSProperties => {
	const colorScheme = useComputedColorScheme('light');

	return useMemo(
		() => getWorkflowNodeToneStyle(label, nodeStyle, colorScheme),
		[label, nodeStyle, colorScheme]
	);
};

export const useWorkflowShellTokens = (): WorkflowShellStyle => {
	const colorScheme = useComputedColorScheme('light');

	return useMemo(() => getWorkflowShellTokens(colorScheme), [colorScheme]);
};
