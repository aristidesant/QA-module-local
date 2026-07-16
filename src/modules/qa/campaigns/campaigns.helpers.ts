import type { CreateCampaignPayload } from '~/models/qa';
import type { CampaignFormValues } from './campaigns.types';

export function buildCampaignPayload(values: CampaignFormValues) {
	return {
		name: values.name.trim(),
		description: values.description.trim() || undefined,
		status: values.status,
		source: values.source || undefined,
	} satisfies CreateCampaignPayload;
}
