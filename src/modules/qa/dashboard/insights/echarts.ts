import * as echarts from 'echarts/core';
import {
	BarChart,
	GaugeChart,
	HeatmapChart,
	LineChart,
	PieChart,
	RadarChart,
	SankeyChart,
	TreemapChart,
} from 'echarts/charts';
import {
	GridComponent,
	LegendComponent,
	PolarComponent,
	RadarComponent,
	TooltipComponent,
	VisualMapComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// Only the chart types the Insights dashboard draws, so the rest of ECharts stays out of the bundle.
echarts.use([
	BarChart,
	GaugeChart,
	HeatmapChart,
	LineChart,
	PieChart,
	RadarChart,
	SankeyChart,
	TreemapChart,
	GridComponent,
	LegendComponent,
	PolarComponent,
	RadarComponent,
	TooltipComponent,
	VisualMapComponent,
	CanvasRenderer,
]);

export { echarts };
export type { EChartsCoreOption as EChartsOption } from 'echarts/core';
