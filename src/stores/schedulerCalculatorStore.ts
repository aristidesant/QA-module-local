import { create } from 'zustand';
import { EstimationCalculationFormData } from '~/models/EstimationCalculationModels';
import {
	calculateSchedulerMetrics,
	SchedulerCalculationMode,
	SchedulerCalculationSummary,
} from '~/modules/campaigns/CampaignsForm/ParametersSection/SchedulerCalculator/calculateSchedulerMetrics';

interface SchedulerCalculatorState {
	formValues: EstimationCalculationFormData;
	mode: SchedulerCalculationMode;
	summary: SchedulerCalculationSummary | null;
	setFormValues: (values: Partial<EstimationCalculationFormData>) => void;
	setMode: (mode: SchedulerCalculationMode) => void;
	calculate: () => void;
	resetSummary: () => void;
}

const initialFormValues: EstimationCalculationFormData = {
	totalRecords: '',
	contactability: '',
	effectiveness: '',
	ahtEffective: '',
	ahtNoEffective: '',
	ahtNoContact: '',
	daysEstimation: '',
	totalAgents: '',
	totalTries: '',
	contactabilityByWaves: {
		wave1: '',
		wave2: '',
		wave3: '',
	},
	wavesStatistics: {
		wave1: {
			totalContacted: '',
			totalEffectiveContact: '',
			totalNoEffectiveContact: '',
			totalNoContact: '',
			triesOverNoContact: '',
			totalTime: '',
		},
		wave2: {
			totalContacted: '',
			totalEffectiveContact: '',
			totalNoEffectiveContact: '',
			totalNoContact: '',
			triesOverNoContact: '',
			totalTime: '',
		},
		wave3: {
			totalContacted: '',
			totalEffectiveContact: '',
			totalNoEffectiveContact: '',
			totalNoContact: '',
			triesOverNoContact: '',
			totalTime: '',
		},
	},
	totalMinutes: '',
	operationalMinutes: '',
	operationalHours: '',
	totalTeamHoursByDay: '',
};

export const useSchedulerCalculatorStore = create<SchedulerCalculatorState>(
	(set, get) => ({
		formValues: initialFormValues,
		mode: 'resources',
		summary: null,
		setFormValues: (values) =>
			set((state) => ({
				formValues: { ...state.formValues, ...values },
			})),
		setMode: (mode) => set(() => ({ mode, summary: null })),
		calculate: () => {
			const { formValues, mode } = get();
			const { formValues: updatedValues, summary } = calculateSchedulerMetrics(
				formValues,
				mode
			);
			set({ formValues: updatedValues, summary });
		},
		resetSummary: () => set({ summary: null }),
	})
);
