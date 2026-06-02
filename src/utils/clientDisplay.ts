type ClientDisplayInput = {
	name?: string | null;
	alias?: string | null;
};

function normalizeValue(value?: string | null): string | null {
	const trimmed = value?.trim();
	return trimmed ? trimmed : null;
}

export function getClientDisplayLabel(client: ClientDisplayInput): string {
	return normalizeValue(client.alias) ?? normalizeValue(client.name) ?? '';
}

export function getClientSecondaryLabel(
	client: ClientDisplayInput
): string | null {
	const alias = normalizeValue(client.alias);
	const name = normalizeValue(client.name);

	if (!alias || !name || alias === name) {
		return null;
	}

	return name;
}

export function formatClientOptionLabel(client: ClientDisplayInput): string {
	const primaryLabel = getClientDisplayLabel(client);
	const secondaryLabel = getClientSecondaryLabel(client);

	return secondaryLabel ? `${primaryLabel} (${secondaryLabel})` : primaryLabel;
}

export function createClientAliasSuggestion(name: string): string {
	return name
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-{2,}/g, '-');
}
