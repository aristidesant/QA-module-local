export type MetricRow = {
	metric: string;
	value: string;
	isPrincipal?: boolean;
};

export type WaveRow = {
	wave: string;
	projected: string;
	totalContacted: string;
	effectiveContact: string;
	noEffectiveContact: string;
	noContact: string;
	triesOverNoContact: string;
	totalTime: string;
	progressValue: number;
};
