import axios from 'axios';
import type { CountryModel } from '~/models/CountryModel';
import { DEFAULT_API_URL } from './config';

interface CountryApiClient {
	getCountries: () => Promise<CountryModel[]>;
}

const countryApi = (
	_authHeader: Record<string, string> = {}
): CountryApiClient => {
	return {
		getCountries: async (): Promise<CountryModel[]> => {
			const response = await axios.get<CountryModel[]>(
				`${DEFAULT_API_URL}/countries`,
				{ headers: { ..._authHeader } }
			);
			return response.data;
		},
	};
};

export default countryApi;
