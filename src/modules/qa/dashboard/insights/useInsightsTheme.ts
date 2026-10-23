import { useMemo } from 'react';
import { useComputedColorScheme } from '@mantine/core';
import type { EChartsOption } from './echarts';

export interface InsightsTheme {
	dark: boolean;
	text: string;
	dimmed: string;
	border: string;
	/** Opaque surface of a tile, for tooltips and chart gaps. */
	surface: string;
	team: Record<string, string>;
	accent: string;
	human: string;
	ai: string;
	alert: string;
	neutral: string;
	indigo: string;
	/** Low to high, for heat and treemap scales. */
	sequential: [string, string];
	/** Tooltip look: the tile surface, a hairline border, tabular numbers. */
	tooltip: InsightsTooltip;
	/** Options every chart shares: type, motion and tooltip look. */
	base: EChartsOption;
}

export interface InsightsTooltip {
	backgroundColor: string;
	borderColor: string;
	borderWidth: number;
	textStyle: { color: string; fontSize: number };
	extraCssText: string;
}

/** A hex color with an alpha channel (`'80'` is about 50 %); anything that is not a plain hex is returned as it is. */
export const withAlpha = (color: string, alpha: string): string =>
	/^#[0-9a-f]{6}$/i.test(color) ? `${color}${alpha}` : color;

/** The Mantine colors the charts use, read at runtime so they follow the theme and the client's palette. */
export const useInsightsTheme = (): InsightsTheme => {
	const scheme = useComputedColorScheme('light');

	return useMemo(() => {
		const dark = scheme === 'dark';
		const css = getComputedStyle(document.documentElement);
		const read = (name: string) => css.getPropertyValue(name).trim();
		const shade = dark ? 4 : 6;
		const color = (name: string) => read(`--mantine-color-${name}-${shade}`);

		const text = read('--mantine-color-text') || (dark ? '#e2e8f0' : '#1a1b1e');
		const dimmed = read('--mantine-color-dimmed') || '#868e96';
		const border = dark
			? 'rgba(148, 163, 184, 0.22)'
			: read('--mantine-color-gray-3') || '#dee2e6';
		const surface = dark ? '#0f172a' : '#ffffff';
		const accent = color('cyan');

		const tooltip: InsightsTooltip = {
			backgroundColor: surface,
			borderColor: border,
			borderWidth: 1,
			textStyle: { color: text, fontSize: 12 },
			extraCssText:
				'border-radius:8px;box-shadow:none;font-variant-numeric:tabular-nums;',
		};

		const base: EChartsOption = {
			textStyle: { fontFamily: 'inherit', color: text },
			animationDuration: 600,
			animationEasing: 'cubicOut',
			animationDurationUpdate: 400,
			tooltip,
		};

		return {
			dark,
			text,
			dimmed,
			border,
			surface,
			team: {
				'Team 1': color('cyan'),
				'Team 2': color('violet'),
				'Team 3': color('teal'),
			},
			accent,
			human: color('cyan'),
			ai: color('violet'),
			alert: color('red'),
			neutral: color('gray'),
			indigo: color('indigo'),
			tooltip,
			sequential: [
				withAlpha(accent, '1f'),
				dark ? withAlpha(accent, '8c') : accent,
			],
			base,
		};
	}, [scheme]);
};

/** Axis look shared by the cartesian charts: quiet lines, small dimmed labels. */
export const axisStyle = (theme: InsightsTheme) => ({
	axisLine: { lineStyle: { color: theme.border } },
	axisTick: { show: false },
	axisLabel: { color: theme.dimmed, fontSize: 11 },
	splitLine: {
		lineStyle: { color: theme.border, type: 'dashed' as const, opacity: 0.6 },
	},
});
