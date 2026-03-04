import { useQuery } from '@tanstack/react-query';
import contactVariableDataApi from '~/api/contactVariableDataApi';

export const useGetContactVariableDataSchema = (
	contactGroupId: number,
	enabled = true
) => {
	return useQuery({
		queryKey: ['contact-variable-data-schema', contactGroupId],
		queryFn: async () => {
			const api = contactVariableDataApi();
			return api.getSchemasByContactGroupId(contactGroupId);
		},
		enabled: enabled && !!contactGroupId,
	});
};
