import { isAxiosError } from 'axios';
import type { CampaignDispositionModel } from '~/models/CampaignDispositionModel';

export type DispositionGroupKey =
	| 'effective'
	| 'notEffective'
	| 'noContact'
	| 'other';

interface DispositionGroupLabels {
	effective: string;
	notEffective: string;
	noContact: string;
	other: string;
}

const dispositionGroupOrder: DispositionGroupKey[] = [
	'effective',
	'notEffective',
	'noContact',
	'other',
];

export const getDispositionPath = (option: CampaignDispositionModel): string =>
	option.path.length > 0 ? option.path.join(' / ') : option.name;

export const getDispositionParentPath = (
	option: CampaignDispositionModel
): string | null => {
	const parentPath = option.path.slice(0, -1);
	return parentPath.length > 0 ? parentPath.join(' / ') : null;
};

export const getDispositionGroupKey = (
	option: CampaignDispositionModel
): DispositionGroupKey => {
	switch (option.contactOutcome?.toUpperCase()) {
		case 'EFFECTIVE':
			return 'effective';
		case 'NOT_EFFECTIVE':
			return 'notEffective';
		case 'NO_CONTACT':
			return 'noContact';
		default:
			return 'other';
	}
};

export const getGroupedDispositionOptions = (
	options: CampaignDispositionModel[],
	labels: DispositionGroupLabels
) =>
	dispositionGroupOrder.flatMap((groupKey) => {
		const items = options
			.filter((option) => getDispositionGroupKey(option) === groupKey)
			.map((option) => ({
				value: String(option.id),
				label: getDispositionPath(option),
			}));

		return items.length > 0
			? [
					{
						group: `${labels[groupKey]} (${items.length})`,
						items,
					},
				]
			: [];
	});

export const getDispositionLoadErrorKey = (error: unknown): string => {
	if (!isAxiosError(error)) {
		return 'disposition.edit.loadErrors.generic';
	}

	switch (error.response?.status) {
		case 403:
			return 'disposition.edit.loadErrors.forbidden';
		case 404:
			return 'disposition.edit.loadErrors.notFound';
		default:
			return 'disposition.edit.loadErrors.generic';
	}
};

export const getDispositionUpdateErrorKey = (error: unknown): string => {
	if (!isAxiosError(error)) {
		return 'disposition.edit.errors.generic';
	}

	switch (error.response?.status) {
		case 400:
			return 'disposition.edit.errors.invalid';
		case 403:
			return 'disposition.edit.errors.forbidden';
		case 404:
			return 'disposition.edit.errors.notFound';
		default:
			return 'disposition.edit.errors.generic';
	}
};
