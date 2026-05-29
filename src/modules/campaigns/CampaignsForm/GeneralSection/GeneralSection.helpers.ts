import type {
	CampaignObjective,
	CampaignObjectiveDropdownOption,
} from '~/models/CampaignObjectiveModel';

export const normalizeCampaignType = (value?: string) =>
	value === 'INBOUND' ? 'INBOUND' : 'OUTBOUND';

type ObjectiveSelectItem = {
	id: number;
	name: string;
	categoryName?: string;
};

export const toObjectiveSelectItem = (
	objective: CampaignObjective | CampaignObjectiveDropdownOption
): ObjectiveSelectItem => ({
	id: objective.id,
	name: objective.name,
	categoryName:
		'categoryName' in objective
			? objective.categoryName
			: objective.category?.name,
});
