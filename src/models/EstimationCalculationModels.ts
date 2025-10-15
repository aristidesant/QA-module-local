export interface WaveStatisticsData {
	totalContacted: string;
	totalEffectiveContact: string;
	totalNoEffectiveContact: string;
	totalNoContact: string;
	triesOverNoContact: string;
	totalTime: string;
}

export interface EstimationCalculationFormData {
	totalRecords: string;
	contactability: string;
	effectiveness: string;
	ahtEffective: string;
	ahtNoEffective: string;
	ahtNoContact: string;
	daysEstimation: string;
	totalAgents: string;
	totalTries: string;
	contactabilityByWaves: {
		wave1: string;
		wave2: string;
		wave3: string;
	};
	wavesStatistics: {
		wave1: WaveStatisticsData;
		wave2: WaveStatisticsData;
		wave3: WaveStatisticsData;
	};
	totalMinutes: string;
	operationalMinutes: string;
	operationalHours: string;
	totalTeamHoursByDay: string;
}
