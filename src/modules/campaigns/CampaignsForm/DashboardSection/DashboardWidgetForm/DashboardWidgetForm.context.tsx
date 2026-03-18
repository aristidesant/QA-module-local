import {
	createContext,
	useContext,
	type ReactNode,
	type Dispatch,
	type SetStateAction,
} from 'react';
import { createFormContext } from '@mantine/form';
import type { DashboardWidgetSizePreset } from '~/modules/campaigns/dashboardLayout';
import type {
	MetricColumnsConfig,
	WidgetFormValues,
	WidgetGuidedState,
	WidgetMetricOption,
	WidgetTypeOption,
} from '../DashboardSection.types';

export const [
	DashboardWidgetFormProvider,
	useDashboardWidgetFormContext,
	useDashboardWidgetForm,
] = createFormContext<WidgetFormValues>();

export type DashboardWidgetFormCompatibility = {
	resultType: boolean;
	supportsGroupBy: boolean;
	supportsTimeSeries: boolean;
};

export type DashboardWidgetFormState = {
	campaignId: number | null;
	dashboardId: number;
	attributeMetricKeys: string[];
	isEditing: boolean;
	isGlobalDashboard: boolean;
	isAttributeMetric: boolean;
	needsGroupedConfig: boolean;
	needsTimeSeriesMetric: boolean;
	needsValueField: boolean;
	groupByIsDerived: boolean;
	titleTouched: boolean;
	titleInputRevision: number;
	advancedOpened: boolean;
	sizePreset: DashboardWidgetSizePreset;
	sizePresetTouched: boolean;
	manualCompatibility: DashboardWidgetFormCompatibility;
	values: WidgetFormValues;
	parsedMetricColumns: MetricColumnsConfig;
	isCampaignLoading: boolean;
	isMetricColumnsLoading: boolean;
	conversationFieldOptions: WidgetMetricOption[];
	dispositionFieldOptions: WidgetMetricOption[];
	conversationFieldValues: string[];
	dispositionFieldValues: string[];
	metricKeyOptions: WidgetMetricOption[];
	fieldNameOptions: WidgetMetricOption[];
	widgetTypeOptions: WidgetTypeOption[];
	metricSourceOptions: WidgetMetricOption[];
	aggregationOptions: WidgetMetricOption[];
	resultTypeOptions: WidgetMetricOption[];
	valueFieldOptions: WidgetMetricOption[];
	filterValueTypeOptions: WidgetMetricOption[];
	viewValueFormatOptions: WidgetMetricOption[];
	sizePresetOptions: { value: string; label: string; disabled?: boolean }[];
	widgetTypeControlOptions: {
		value: string;
		label: string;
		disabled?: boolean;
	}[];
	sourceTypeControlOptions: {
		value: string;
		label: string;
		disabled?: boolean;
	}[];
	guidedState: WidgetGuidedState;
	groupBySuggestions: string[];
	filterKeySuggestions: string[];
	placementLayout: {
		positionX: number;
		positionY: number;
		width: number;
		height: number;
	};
	advancedSettingsCount: number;
	handlers: {
		setAdvancedOpened: Dispatch<SetStateAction<boolean>>;
		setTitleTouched: (touched: boolean) => void;
		handleWidgetTypeChange: (value: string | null) => void;
		handleSourceTypeChange: (value: string | null) => void;
		handleAggregationTypeChange: (value: string | null) => void;
		handleMetricKeyChange: (value: string | null) => void;
		handleFieldNameChange: (value: string | null) => void;
		handleValueFieldChange: (value: string | null) => void;
		handleGroupByChange: (value: string | null) => void;
		handleResultTypeChange: (value: string | null) => void;
		handleViewValueFormatChange: (value: string | null) => void;
		handleDefaultFilterKeyChange: (index: number, value: string | null) => void;
		handleDefaultFilterTypeChange: (
			index: number,
			value: string | null
		) => void;
		handleDefaultFilterValueChange: (
			index: number,
			value: string | null
		) => void;
		handleSizePresetChange: (value: string | null) => void;
		addDefaultFilterRow: () => void;
		removeDefaultFilterRow: (index: number) => void;
		handleEnabledChange: (checked: boolean) => void;
		handleSupportsGroupByChange: (checked: boolean) => void;
		handleSupportsTimeSeriesChange: (checked: boolean) => void;
		handleViewLegendChange: (checked: boolean) => void;
		handleTitleChange: (value: string) => void;
	};
};

const DashboardWidgetFormStateContext =
	createContext<DashboardWidgetFormState | null>(null);

type DashboardWidgetFormStateProviderProps = {
	children: ReactNode;
	state: DashboardWidgetFormState;
};

export const DashboardWidgetFormStateProvider = ({
	children,
	state,
}: DashboardWidgetFormStateProviderProps) => {
	return (
		<DashboardWidgetFormStateContext.Provider value={state}>
			{children}
		</DashboardWidgetFormStateContext.Provider>
	);
};

export const useDashboardWidgetFormState = () => {
	const context = useContext(DashboardWidgetFormStateContext);

	if (!context) {
		throw new Error(
			'useDashboardWidgetFormState must be used within DashboardWidgetFormStateProvider'
		);
	}

	return context;
};
