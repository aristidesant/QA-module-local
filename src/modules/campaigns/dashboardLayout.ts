import type { DashboardWidgetType } from '~/models/AnalyticsDashboard';

export const DASHBOARD_LAYOUT_COLUMNS = 12;
export const DASHBOARD_LAYOUT_ROW_HEIGHT = 132;

export type DashboardWidgetSizePreset =
	| 'SMALL'
	| 'MEDIUM'
	| 'LARGE'
	| 'FULL'
	| 'CUSTOM';

type StandardDashboardWidgetSizePreset = Exclude<
	DashboardWidgetSizePreset,
	'CUSTOM'
>;

type WidgetLayout = {
	positionX: number;
	positionY: number;
	width: number;
	height: number;
};

export type DashboardLayoutItem = WidgetLayout & {
	id?: number | string;
};

export const DASHBOARD_WIDGET_SIZE_PRESETS: Record<
	StandardDashboardWidgetSizePreset,
	Pick<WidgetLayout, 'width' | 'height'>
> = {
	SMALL: { width: 3, height: 2 },
	MEDIUM: { width: 4, height: 2 },
	LARGE: { width: 6, height: 3 },
	FULL: { width: 12, height: 3 },
};

export const DEFAULT_WIDGET_SIZE_PRESET: StandardDashboardWidgetSizePreset =
	'MEDIUM';

export const DEFAULT_WIDGET_LAYOUT: WidgetLayout = {
	positionX: 0,
	positionY: 0,
	...DASHBOARD_WIDGET_SIZE_PRESETS[DEFAULT_WIDGET_SIZE_PRESET],
};

export const DASHBOARD_WIDGET_MIN_DIMENSIONS: Record<
	DashboardWidgetType,
	Pick<WidgetLayout, 'width' | 'height'>
> = {
	KPI: { width: 2, height: 1 },
	LINE_CHART: { width: 2, height: 1 },
	BAR_CHART: { width: 2, height: 1 },
	PIE_CHART: { width: 2, height: 1 },
	DONUT_CHART: { width: 2, height: 1 },
	TABLE: { width: 2, height: 1 },
	FUNNEL: { width: 2, height: 1 },
};

const DASHBOARD_WIDGET_AUTO_DIMENSIONS: Record<
	DashboardWidgetType,
	Pick<WidgetLayout, 'width' | 'height'>
> = {
	KPI: { width: 3, height: 2 },
	LINE_CHART: { width: 6, height: 3 },
	BAR_CHART: { width: 6, height: 3 },
	PIE_CHART: { width: 5, height: 3 },
	DONUT_CHART: { width: 5, height: 3 },
	TABLE: { width: 6, height: 4 },
	FUNNEL: { width: 6, height: 3 },
};

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

export const getWidgetSizePreset = (
	width: number,
	height: number
): DashboardWidgetSizePreset => {
	const matchedPreset = (Object.entries(DASHBOARD_WIDGET_SIZE_PRESETS).find(
		([, presetDimensions]) =>
			presetDimensions.width === width && presetDimensions.height === height
	)?.[0] ?? 'CUSTOM') as DashboardWidgetSizePreset;

	return matchedPreset;
};

export const getWidgetDimensionsForPreset = (
	preset: DashboardWidgetSizePreset,
	fallback: Pick<
		WidgetLayout,
		'width' | 'height'
	> = DASHBOARD_WIDGET_SIZE_PRESETS[DEFAULT_WIDGET_SIZE_PRESET]
) => {
	if (preset === 'CUSTOM') {
		return fallback;
	}

	return DASHBOARD_WIDGET_SIZE_PRESETS[preset];
};

export const getMaxWidgetPositionX = (
	width: number,
	totalColumns = DASHBOARD_LAYOUT_COLUMNS
) => Math.max(0, totalColumns - clamp(width, 1, totalColumns));

export const getMinimumDimensionsForWidgetType = (
	widgetType: DashboardWidgetType
) => DASHBOARD_WIDGET_MIN_DIMENSIONS[widgetType];

export const getRecommendedDimensionsForWidgetType = (
	widgetType: DashboardWidgetType
) => DASHBOARD_WIDGET_AUTO_DIMENSIONS[widgetType];

const getWidgetAutoLayoutPriority = (widgetType: DashboardWidgetType) => {
	if (widgetType === 'KPI') {
		return 0;
	}

	if (widgetType === 'TABLE') {
		return 2;
	}

	return 1;
};

export const applyWidgetMinimumDimensions = <T extends WidgetLayout>(
	layout: T,
	widgetType: DashboardWidgetType
) => {
	const minimumDimensions = getMinimumDimensionsForWidgetType(widgetType);

	return {
		...layout,
		width: Math.max(layout.width, minimumDimensions.width),
		height: Math.max(layout.height, minimumDimensions.height),
	};
};

export const normalizeWidgetLayout = <T extends WidgetLayout>(
	layout: T,
	totalColumns = DASHBOARD_LAYOUT_COLUMNS
) => {
	const width = clamp(layout.width, 1, totalColumns);
	const height = Math.max(layout.height, 1);
	const positionX = clamp(layout.positionX, 0, getMaxWidgetPositionX(width));
	const positionY = Math.max(layout.positionY, 0);

	return {
		...layout,
		width,
		height,
		positionX,
		positionY,
	};
};

export const normalizeWidgetLayoutForType = <T extends WidgetLayout>(
	layout: T,
	widgetType: DashboardWidgetType,
	totalColumns = DASHBOARD_LAYOUT_COLUMNS
) =>
	normalizeWidgetLayout(
		applyWidgetMinimumDimensions(layout, widgetType),
		totalColumns
	);

export const compareWidgetLayouts = (
	left: Pick<WidgetLayout, 'positionX' | 'positionY'>,
	right: Pick<WidgetLayout, 'positionX' | 'positionY'>
) => {
	if (left.positionY !== right.positionY) {
		return left.positionY - right.positionY;
	}

	return left.positionX - right.positionX;
};

export const layoutsOverlap = (left: WidgetLayout, right: WidgetLayout) => {
	const leftEndX = left.positionX + left.width;
	const rightEndX = right.positionX + right.width;
	const leftEndY = left.positionY + left.height;
	const rightEndY = right.positionY + right.height;

	return (
		left.positionX < rightEndX &&
		leftEndX > right.positionX &&
		left.positionY < rightEndY &&
		leftEndY > right.positionY
	);
};

export const hasOverlappingWidgetLayouts = (items: WidgetLayout[]) => {
	for (let leftIndex = 0; leftIndex < items.length; leftIndex += 1) {
		for (
			let rightIndex = leftIndex + 1;
			rightIndex < items.length;
			rightIndex += 1
		) {
			if (layoutsOverlap(items[leftIndex], items[rightIndex])) {
				return true;
			}
		}
	}

	return false;
};

export const findNextAvailableWidgetLayout = (
	items: DashboardLayoutItem[],
	dimensions: Pick<WidgetLayout, 'width' | 'height'>,
	options?: { excludeId?: number | string; totalColumns?: number }
) => {
	const totalColumns = options?.totalColumns ?? DASHBOARD_LAYOUT_COLUMNS;
	const normalizedDimensions = normalizeWidgetLayout(
		{
			positionX: 0,
			positionY: 0,
			width: dimensions.width,
			height: dimensions.height,
		},
		totalColumns
	);
	const normalizedItems = items
		.filter((item) => item.id !== options?.excludeId)
		.map((item) => normalizeWidgetLayout(item, totalColumns));
	const maxPositionX = getMaxWidgetPositionX(
		normalizedDimensions.width,
		totalColumns
	);
	const searchRowLimit = Math.max(
		12,
		normalizedItems.reduce(
			(maxRow, item) => Math.max(maxRow, item.positionY + item.height + 4),
			0
		)
	);

	for (let positionY = 0; positionY <= searchRowLimit; positionY += 1) {
		for (let positionX = 0; positionX <= maxPositionX; positionX += 1) {
			const candidate = {
				positionX,
				positionY,
				width: normalizedDimensions.width,
				height: normalizedDimensions.height,
			};

			if (normalizedItems.every((item) => !layoutsOverlap(candidate, item))) {
				return candidate;
			}
		}
	}

	return {
		positionX: 0,
		positionY: searchRowLimit + 1,
		width: normalizedDimensions.width,
		height: normalizedDimensions.height,
	};
};

const compareLayoutPositions = (
	left: Pick<WidgetLayout, 'positionX' | 'positionY'>,
	right: Pick<WidgetLayout, 'positionX' | 'positionY'>
) => compareWidgetLayouts(left, right);

const toDashboardLayoutItem = <
	T extends {
		widgetId: number;
		positionX: number;
		positionY: number;
		width: number;
		height: number;
	},
>(
	layout: T
): DashboardLayoutItem & T => ({
	...layout,
	id: layout.widgetId,
});

export const findNearestAvailableWidgetLayout = (
	items: DashboardLayoutItem[],
	dimensions: Pick<WidgetLayout, 'width' | 'height'>,
	origin: Pick<WidgetLayout, 'positionX' | 'positionY'>,
	options?: { excludeId?: number | string; totalColumns?: number }
) => {
	const totalColumns = options?.totalColumns ?? DASHBOARD_LAYOUT_COLUMNS;
	const normalizedDimensions = normalizeWidgetLayout(
		{
			positionX: origin.positionX,
			positionY: origin.positionY,
			width: dimensions.width,
			height: dimensions.height,
		},
		totalColumns
	);
	const normalizedItems = items
		.filter((item) => item.id !== options?.excludeId)
		.map((item) => normalizeWidgetLayout(item, totalColumns));
	const maxPositionX = getMaxWidgetPositionX(
		normalizedDimensions.width,
		totalColumns
	);
	const searchRowLimit = Math.max(
		12,
		normalizedItems.reduce(
			(maxRow, item) => Math.max(maxRow, item.positionY + item.height + 4),
			0
		),
		normalizedDimensions.positionY + normalizedDimensions.height + 4
	);

	let bestCandidate: Pick<
		WidgetLayout,
		'positionX' | 'positionY' | 'width' | 'height'
	> | null = null;
	let bestDistance = Number.POSITIVE_INFINITY;

	for (let positionY = 0; positionY <= searchRowLimit; positionY += 1) {
		for (let positionX = 0; positionX <= maxPositionX; positionX += 1) {
			const candidate = {
				positionX,
				positionY,
				width: normalizedDimensions.width,
				height: normalizedDimensions.height,
			};

			if (normalizedItems.some((item) => layoutsOverlap(candidate, item))) {
				continue;
			}

			const distance =
				Math.abs(positionX - normalizedDimensions.positionX) +
				Math.abs(positionY - normalizedDimensions.positionY);

			if (
				!bestCandidate ||
				distance < bestDistance ||
				(distance === bestDistance &&
					(positionY < bestCandidate.positionY ||
						(positionY === bestCandidate.positionY &&
							positionX < bestCandidate.positionX)))
			) {
				bestCandidate = candidate;
				bestDistance = distance;
			}
		}
	}

	if (bestCandidate) {
		return bestCandidate;
	}

	return {
		positionX: 0,
		positionY: searchRowLimit + 1,
		width: normalizedDimensions.width,
		height: normalizedDimensions.height,
	};
};

export const resolveNearestWidgetLayouts = <
	T extends {
		widgetId: number;
		positionX: number;
		positionY: number;
		width: number;
		height: number;
	},
>(
	layouts: T[],
	changedLayout: T,
	widgetTypeMap: Map<number, DashboardWidgetType>,
	totalColumns = DASHBOARD_LAYOUT_COLUMNS
): T[] => {
	const normalizedLayouts = layouts.map((layout) =>
		normalizeWidgetLayoutForType(
			layout,
			widgetTypeMap.get(layout.widgetId) ?? 'KPI',
			totalColumns
		)
	);
	const normalizedChangedLayout = normalizeWidgetLayoutForType(
		changedLayout,
		widgetTypeMap.get(changedLayout.widgetId) ?? 'KPI',
		totalColumns
	);
	const fixedLayouts = normalizedLayouts.filter(
		(layout) => layout.widgetId !== normalizedChangedLayout.widgetId
	);
	const collidingLayouts = fixedLayouts.filter((layout) =>
		layoutsOverlap(layout, normalizedChangedLayout)
	);
	const resolvedLayouts = fixedLayouts.filter(
		(layout) => !layoutsOverlap(layout, normalizedChangedLayout)
	);
	const occupiedLayouts: DashboardLayoutItem[] = [
		...resolvedLayouts.map(toDashboardLayoutItem),
		toDashboardLayoutItem(normalizedChangedLayout),
	];
	const placedLayouts: T[] = [];

	for (const layout of collidingLayouts.sort(compareLayoutPositions)) {
		const candidate = findNearestAvailableWidgetLayout(
			[...occupiedLayouts, ...placedLayouts.map(toDashboardLayoutItem)],
			{
				width: layout.width,
				height: layout.height,
			},
			{
				positionX: layout.positionX,
				positionY: layout.positionY,
			},
			{
				totalColumns,
			}
		);
		const widgetType = widgetTypeMap.get(layout.widgetId) ?? 'KPI';
		const resolvedLayout = normalizeWidgetLayoutForType(
			{
				...layout,
				positionX: candidate.positionX,
				positionY: candidate.positionY,
				width: candidate.width,
				height: candidate.height,
			},
			widgetType,
			totalColumns
		);

		placedLayouts.push(resolvedLayout);
		occupiedLayouts.push(toDashboardLayoutItem(resolvedLayout));
	}

	return [...resolvedLayouts, normalizedChangedLayout, ...placedLayouts].sort(
		compareLayoutPositions
	) as T[];
};

export const autoOrganizeWidgetLayouts = <
	T extends { widgetId: number; width: number; height: number },
>(
	layouts: T[],
	widgetTypeMap: Map<number, DashboardWidgetType>,
	totalColumns = DASHBOARD_LAYOUT_COLUMNS
): Array<{
	widgetId: number;
	positionX: number;
	positionY: number;
	width: number;
	height: number;
}> => {
	const orderedLayouts = layouts
		.map((layout, order) => {
			const widgetType = widgetTypeMap.get(layout.widgetId) ?? 'KPI';

			return {
				...layout,
				order,
				recommendedDimensions:
					getRecommendedDimensionsForWidgetType(widgetType),
				widgetType,
			};
		})
		.sort((left, right) => {
			const leftPriority = getWidgetAutoLayoutPriority(left.widgetType);
			const rightPriority = getWidgetAutoLayoutPriority(right.widgetType);

			if (leftPriority !== rightPriority) {
				return leftPriority - rightPriority;
			}

			const leftArea =
				left.recommendedDimensions.width * left.recommendedDimensions.height;
			const rightArea =
				right.recommendedDimensions.width * right.recommendedDimensions.height;

			if (leftArea !== rightArea) {
				return rightArea - leftArea;
			}

			return left.order - right.order;
		});

	const placed: DashboardLayoutItem[] = [];
	const result: Array<{
		widgetId: number;
		positionX: number;
		positionY: number;
		width: number;
		height: number;
	}> = [];

	for (const widget of orderedLayouts) {
		const position = findNextAvailableWidgetLayout(
			placed,
			widget.recommendedDimensions,
			{ totalColumns }
		);

		const entry = normalizeWidgetLayoutForType(
			{
				widgetId: widget.widgetId,
				positionX: position.positionX,
				positionY: position.positionY,
				width: position.width,
				height: position.height,
			},
			widget.widgetType,
			totalColumns
		);

		const normalizedEntry = {
			widgetId: widget.widgetId,
			positionX: entry.positionX,
			positionY: entry.positionY,
			width: entry.width,
			height: entry.height,
		};

		placed.push({ ...normalizedEntry, id: widget.widgetId });
		result.push(normalizedEntry);
	}

	return result;
};
