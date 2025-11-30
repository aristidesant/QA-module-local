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
		const mockResult: metricsModule.SchedulerCalculationResult = {
			formValues: {
				totalRecords: '100',
				contactability: '50',
				effectiveness: '80',
				ahtEffective: '120',
				ahtNoEffective: '60',
				ahtNoContact: '30',
				daysEstimation: '5',
				totalAgents: '10',
				totalTries: '270',
				contactabilityByWaves: { wave1: '29', wave2: '15', wave3: '6' },
				wavesStatistics: {
					wave1: {
						totalContacted: '29',
						totalEffectiveContact: '23',
						totalNoEffectiveContact: '6',
						totalNoContact: '71',
						triesOverNoContact: '192',
						totalTime: '8520',
					},
					wave2: {
						totalContacted: '11',
						totalEffectiveContact: '9',
						totalNoEffectiveContact: '2',
						totalNoContact: '60',
						triesOverNoContact: '162',
						totalTime: '6000',
					},
					wave3: {
						totalContacted: '4',
						totalEffectiveContact: '3',
						totalNoEffectiveContact: '1',
						totalNoContact: '56',
						triesOverNoContact: '151',
						totalTime: '5000',
					},
				},
				totalMinutes: '19520',
				operationalMinutes: '30500.00',
				operationalHours: '508.33',
				totalTeamHoursByDay: '80.00',
			},
			summary: {
				totalTries: 270,
				totalAgents: 10,
				daysEstimation: 5,
				totalMinutes: 19520,
				operationalMinutes: 30500,
				operationalHours: 508.33,
				totalTeamHoursByDay: 80,
				waveDistribution: [
					{ wave: 'wave1', basePercentage: 58, derivedPercentage: 29 },
					{ wave: 'wave2', basePercentage: 30, derivedPercentage: 15 },
					{ wave: 'wave3', basePercentage: 12, derivedPercentage: 6 },
				],
				waves: [
					{
						wave: 'wave1',
						totalContacted: 29,
						totalEffectiveContact: 23,
						totalNoEffectiveContact: 6,
						totalNoContact: 71,
						triesOverNoContact: 192,
						totalTime: 8520,
					},
					{
						wave: 'wave2',
						totalContacted: 11,
						totalEffectiveContact: 9,
						totalNoEffectiveContact: 2,
						totalNoContact: 60,
						triesOverNoContact: 162,
						totalTime: 6000,
					},
					{
						wave: 'wave3',
						totalContacted: 4,
						totalEffectiveContact: 3,
						totalNoEffectiveContact: 1,
						totalNoContact: 56,
						triesOverNoContact: 151,
						totalTime: 5000,
					},
				],
			},
		};
		vi.mocked(metricsModule.calculateSchedulerMetrics).mockReturnValue(
			mockResult
		);

		act(() => {
			useSchedulerCalculatorStore.getState().calculate();
		});

		const state = useSchedulerCalculatorStore.getState();
		expect(metricsModule.calculateSchedulerMetrics).toHaveBeenCalled();
		expect(state.formValues).toEqual(mockResult.formValues);
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
