import axios from 'axios';
import { DEFAULT_API_URL } from './config';
import type {
	SubagentTemplate,
	SubagentTemplateFilters,
} from '~/models/SubagentTemplateModel';

const subagentTemplatesApi = () => {
	return {
		findAll: async (
			filters?: SubagentTemplateFilters
		): Promise<SubagentTemplate[]> => {
			const { data } = await axios.get<SubagentTemplate[]>(
				`${DEFAULT_API_URL}/subagent-templates`,
				{ params: filters }
			);
			return data;
		},
	};
};

export default subagentTemplatesApi;
