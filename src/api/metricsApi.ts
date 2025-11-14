import axios from 'axios';
import { DEFAULT_API_URL } from './config';
import { LiveMetricsResponse } from '~/models/LiveMetrics';

export const getLiveMetrics = async (
	contactGroupId: number,
	range: string
): Promise<LiveMetricsResponse> => {
	const response = await axios.get(
		`${DEFAULT_API_URL}/live-metrics/contact-groups/${contactGroupId}`,
		{
			params: { range },
		}
	);
	return response.data;
};
