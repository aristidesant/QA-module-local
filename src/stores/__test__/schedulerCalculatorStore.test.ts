import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useSchedulerCalculatorStore } from '../schedulerCalculatorStore';
import * as metricsModule from '~/modules/campaigns/CampaignsForm/ParametersSection/SchedulerCalculator/calculateSchedulerMetrics';

// Mock the calculation function
vi.mock(
	'~/modules/campaigns/CampaignsForm/ParametersSection/SchedulerCalculator/calculateSchedulerMetrics',
	() => ({
		calculateSchedulerMetrics: vi.fn(),
	})
);

describe('useSchedulerCalculatorStore', () => {
	beforeEach(() => {
		// Reset store state manually if needed, or rely on setFormValues/resetSummary
		// Since it's a singleton, better to reset
		act(() => {
			useSchedulerCalculatorStore.setState({
				formValues: {
					totalRecords: '',
					contactability: '',
					effectiveness: '',
					ahtEffective: '',
					ahtNoEffective: '',
					ahtNoContact: '',
					daysEstimation: '',
					totalAgents: '',
					totalTries: '',
					contactabilityByWaves: { wave1: '', wave2: '', wave3: '' },
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
				},
				mode: 'resources',
				summary: null,
			});
		});
		vi.clearAllMocks();
	});

	it('should have initial state', () => {
		const state = useSchedulerCalculatorStore.getState();
		expect(state.mode).toBe('resources');
		expect(state.summary).toBeNull();
	});

	it('should set form values', () => {
		act(() => {
			useSchedulerCalculatorStore
				.getState()
				.setFormValues({ totalRecords: '100' });
		});
		expect(useSchedulerCalculatorStore.getState().formValues.totalRecords).toBe(
			'100'
		);
	});

	it('should set mode and reset summary', () => {
		// Set summary first
		act(() => {
			useSchedulerCalculatorStore.setState({ summary: {} as any });
		});

		act(() => {
			useSchedulerCalculatorStore.getState().setMode('time');
		});

		const state = useSchedulerCalculatorStore.getState();
		expect(state.mode).toBe('time');
		expect(state.summary).toBeNull();
	});

	it('should calculate metrics', () => {
		const mockResult = {
			formValues: { totalRecords: '100' },
			summary: { totalHours: 10 },
		};
		// @ts-ignore
		vi.mocked(metricsModule.calculateSchedulerMetrics).mockReturnValue(
			mockResult
		);

		act(() => {
			useSchedulerCalculatorStore.getState().calculate();
		});

		const state = useSchedulerCalculatorStore.getState();
		expect(metricsModule.calculateSchedulerMetrics).toHaveBeenCalled();
		// @ts-ignore
		expect(state.formValues).toEqual(mockResult.formValues);
		// @ts-ignore
		expect(state.summary).toEqual(mockResult.summary);
	});

	it('should reset summary', () => {
		act(() => {
			useSchedulerCalculatorStore.setState({ summary: {} as any });
		});
		act(() => {
			useSchedulerCalculatorStore.getState().resetSummary();
		});
		expect(useSchedulerCalculatorStore.getState().summary).toBeNull();
	});
});
