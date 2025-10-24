import { useQuery } from '@tanstack/react-query';
import countryApi from '~/api/countryApi';

export const useGetCountries = () => {
	return useQuery({
		queryKey: ['countries'],
		queryFn: async () => {
			const api = countryApi();
			return api.getCountries();
		},
	});
};
