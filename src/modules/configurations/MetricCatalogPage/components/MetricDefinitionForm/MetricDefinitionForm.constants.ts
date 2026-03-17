import type { MetricDefinitionFormValues } from './MetricDefinitionForm.types';

export const EMPTY_FORM_VALUES: MetricDefinitionFormValues = {
	scope: 'global',
	campaignId: '',
	name: '',
	description: '',
	sourceType: 'CONVERSATION',
	aggregationType: 'COUNT',
	fieldName: '',
	metricKey: '',
	valueField: '',
	resultType: 'NUMBER',
	supportsGroupBy: false,
	supportsTimeSeries: false,
	defaultFilterJson: '',
};
