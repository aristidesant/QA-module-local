import { EstimationCalculationFormData } from '~/models/EstimationCalculationModels';

export type SchedulerCalculationMode = 'resources' | 'time';

export type WaveKey = 'wave1' | 'wave2' | 'wave3';

interface WaveBaseSummary {
	wave: WaveKey;
	basePercentage: number;
	derivedPercentage: number;
}

interface WaveDetailedSummary {
	wave: WaveKey;
	totalContacted: number;
	totalEffectiveContact: number;
	totalNoEffectiveContact: number;
	totalNoContact: number;
	triesOverNoContact: number;
	totalTime: number;
}

export interface SchedulerCalculationSummary {
	totalTries: number;
	totalAgents: number;
	daysEstimation: number;
	totalMinutes: number;
	operationalMinutes: number;
	operationalHours: number;
	totalTeamHoursByDay: number;
	waveDistribution: WaveBaseSummary[];
	waves: WaveDetailedSummary[];
}

export interface SchedulerCalculationResult {
	formValues: EstimationCalculationFormData;
	summary: SchedulerCalculationSummary;
}

export const SCHEDULER_CALCULATOR_CONFIG = {
	totalPhonesByAgent: 2.7,
	averageRecordsWorkByAgents: 100,
	minutesMan: 0.64,
	hoursByDay: 8,
	contactabilityByWaves: {
		wave1: 0.58,
		wave2: 0.3,
		wave3: 0.12,
	} as Record<WaveKey, number>,
} as const;

const waveOrder: WaveKey[] = ['wave1', 'wave2', 'wave3'];

const toPositiveNumber = (value: string, fallback = 0): number => {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const toPositiveOrDefault = (value: string, fallback: number): number => {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const roundToIntegerString = (value: number): string =>
	Math.round(value || 0).toString();

export const calculateSchedulerMetrics = (
	values: EstimationCalculationFormData,
	mode: SchedulerCalculationMode
): SchedulerCalculationResult => {
	const totalRecords = toPositiveNumber(values.totalRecords);
	const contactabilityRate = toPositiveNumber(values.contactability) / 100;
	const effectivenessRate = toPositiveNumber(values.effectiveness) / 100;
	const ahtEffective = toPositiveNumber(values.ahtEffective);
	const ahtNoEffective = toPositiveNumber(values.ahtNoEffective);
	const ahtNoContact = toPositiveNumber(values.ahtNoContact);

	const totalTries =
		totalRecords * SCHEDULER_CALCULATOR_CONFIG.totalPhonesByAgent;

	let accumulatedContacted = 0;
	const waveDistribution: WaveBaseSummary[] = [];
	const waveSummaries: WaveDetailedSummary[] = [];

	for (const wave of waveOrder) {
		const basePercentage =
			SCHEDULER_CALCULATOR_CONFIG.contactabilityByWaves[wave] * 100;
		const waveContactability =
			contactabilityRate *
			SCHEDULER_CALCULATOR_CONFIG.contactabilityByWaves[wave];

		const derivedPercentage = waveContactability * 100;
		waveDistribution.push({
			wave,
			basePercentage,
			derivedPercentage,
		});

		const remainingRecords = Math.max(totalRecords - accumulatedContacted, 0);
		const totalContacted = remainingRecords * waveContactability;
		const totalEffectiveContact = totalContacted * effectivenessRate;
		const totalNoEffectiveContact = totalContacted - totalEffectiveContact;
		const totalNoContact = Math.max(remainingRecords - totalContacted, 0);
		const triesOverNoContact =
			SCHEDULER_CALCULATOR_CONFIG.totalPhonesByAgent * totalNoContact;
		const totalTime =
			totalEffectiveContact * ahtEffective +
			totalNoEffectiveContact * ahtNoEffective +
			triesOverNoContact * ahtNoContact;

		accumulatedContacted += totalContacted;

		waveSummaries.push({
			wave,
			totalContacted,
			totalEffectiveContact,
			totalNoEffectiveContact,
			totalNoContact,
			triesOverNoContact,
			totalTime,
		});
	}

	const totalMinutes = waveSummaries.reduce(
		(acc, current) => acc + current.totalTime,
		0
	);
	const operationalMinutesRaw =
		totalMinutes / SCHEDULER_CALCULATOR_CONFIG.minutesMan;
	const operationalHours = operationalMinutesRaw / 60;

	const providedDays = toPositiveOrDefault(values.daysEstimation, 1);
	const providedAgents = toPositiveOrDefault(values.totalAgents, 1);

	const totalAgents =
		mode === 'resources'
			? Math.max(
					totalRecords /
						SCHEDULER_CALCULATOR_CONFIG.averageRecordsWorkByAgents /
						providedDays,
					1
				)
			: providedAgents;

	const totalTeamHoursByDay =
		totalAgents * SCHEDULER_CALCULATOR_CONFIG.hoursByDay;

	const daysEstimation =
		mode === 'time'
			? totalTeamHoursByDay === 0
				? 0
				: operationalHours / totalTeamHoursByDay
			: providedDays;

	const wavesStatistics = waveSummaries.reduce<
		EstimationCalculationFormData['wavesStatistics']
	>(
		(acc, wave) => {
			acc[wave.wave] = {
				totalContacted: roundToIntegerString(wave.totalContacted),
				totalEffectiveContact: roundToIntegerString(wave.totalEffectiveContact),
				totalNoEffectiveContact: roundToIntegerString(
					wave.totalNoEffectiveContact
				),
				totalNoContact: roundToIntegerString(wave.totalNoContact),
				triesOverNoContact: roundToIntegerString(wave.triesOverNoContact),
				totalTime: roundToIntegerString(wave.totalTime),
			};
			return acc;
		},
		{
			wave1: {
				totalContacted: '0',
				totalEffectiveContact: '0',
				totalNoEffectiveContact: '0',
				totalNoContact: '0',
				triesOverNoContact: '0',
				totalTime: '0',
			},
			wave2: {
				totalContacted: '0',
				totalEffectiveContact: '0',
				totalNoEffectiveContact: '0',
				totalNoContact: '0',
				triesOverNoContact: '0',
				totalTime: '0',
			},
			wave3: {
				totalContacted: '0',
				totalEffectiveContact: '0',
				totalNoEffectiveContact: '0',
				totalNoContact: '0',
				triesOverNoContact: '0',
				totalTime: '0',
			},
		}
	);

	const updatedValues: EstimationCalculationFormData = {
		...values,
		totalTries: roundToIntegerString(totalTries),
		totalAgents: totalAgents.toFixed(2),
		daysEstimation:
			mode === 'time' ? daysEstimation.toFixed(2) : providedDays.toString(),
		contactabilityByWaves: waveDistribution.reduce<
			EstimationCalculationFormData['contactabilityByWaves']
		>(
			(acc, wave) => {
				acc[wave.wave] = roundToIntegerString(wave.derivedPercentage);
				return acc;
			},
			{
				wave1: '0',
				wave2: '0',
				wave3: '0',
			}
		),
		wavesStatistics,
		totalMinutes: roundToIntegerString(totalMinutes),
		operationalMinutes: operationalMinutesRaw.toFixed(2),
		operationalHours: operationalHours.toFixed(2),
		totalTeamHoursByDay: totalTeamHoursByDay.toFixed(2),
	};

	const summary: SchedulerCalculationSummary = {
		totalTries,
		totalAgents,
		daysEstimation,
		totalMinutes,
		operationalMinutes: operationalMinutesRaw,
		operationalHours,
		totalTeamHoursByDay,
		waveDistribution,
		waves: waveSummaries,
	};

	return {
		formValues: updatedValues,
		summary,
	};
};
