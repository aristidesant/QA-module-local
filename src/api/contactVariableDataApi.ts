import axios from 'axios';
import type {
	CampaignContactSchema,
	CampaignContactSchemaField,
} from '~/models/CampaignContactSchemaModel';
import { DEFAULT_API_URL } from './config';

const contactVariableDataApi = () => {
	return {
		getSchemasByContactGroupId: async (
			contactGroupId: number
		): Promise<CampaignContactSchemaField[]> => {
			const response = await axios.get<CampaignContactSchema[]>(
				`${DEFAULT_API_URL}/contact-variable-data/schemas/contact-group/${contactGroupId}`
			);
			return response.data[0]?.schemaFields ?? [];
		},
	};
};

export default contactVariableDataApi;
