import type {
	MetricAggregationType,
	MetricDefinition,
	MetricResultType,
	MetricSourceType,
	MetricValueField,
} from '~/models/AnalyticsDashboard';
import type { MetricCatalogOption } from '../../MetricCatalogPage.types';

export type MetricDefinitionFormValues = {
	scope: 'global' | 'campaign';
	campaignId: string;
	key: string;
	name: string;
	description: string;
	sourceType: MetricSourceType;
	aggregationType: MetricAggregationType;
	fieldName: string;
	metricKey: string;
	valueField: MetricValueField | '';
	resultType: MetricResultType;
	supportsGroupBy: boolean;
	supportsTimeSeries: boolean;
	defaultFilterJson: string;
};

export type MetricDefinitionFormProps = {
	metric?: MetricDefinition | null;
	campaignOptions: MetricCatalogOption[];
	onCancel: () => void;
	onSuccess: () => void;
};
