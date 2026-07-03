import type {
	CreateClientRequest,
	ClientModel,
	UpdateClientRequest,
} from '~/models/ClientModel';
import type {
	ClientThemeModel,
	UpdateClientThemeRequest,
} from '~/models/ClientTheme';
import {
	DEFAULT_PRIMARY_COLOR,
	DEFAULT_SECONDARY_COLOR,
} from '~/utils/clientTheme';
import { CLIENT_FORM_INITIAL_VALUES } from './ClientForm.constants';
import type { ClientFormValues } from './ClientForm.types';

export const hydrateClientFormValues = (
	client: ClientModel,
	theme?: ClientThemeModel
): ClientFormValues => ({
	...CLIENT_FORM_INITIAL_VALUES,
	name: client.name,
	alias: client.alias ?? '',
	description: client.description ?? '',
	email: client.email ?? '',
	phone: client.phone ?? '',
	address: client.address ?? '',
	rnc: client.rnc ?? '',
	userId: client.userId ?? null,
	countryId: client.countryId ?? null,
	website: client.website ?? '',
	pocUserId: client.pocUserId ?? null,
	invoiceTemplateFileId: client.invoiceTemplateFileId ?? null,
	brandName: theme?.brandName ?? '',
	primaryColor: theme?.primaryColor || DEFAULT_PRIMARY_COLOR,
	secondaryColor: theme?.secondaryColor || DEFAULT_SECONDARY_COLOR,
	logoFileId: theme?.logoFileId ?? null,
	logoUrl: theme?.logoUrl ?? null,
});

export const buildCreateClientPayload = (
	values: ClientFormValues
): CreateClientRequest => ({
	name: values.name.trim(),
	alias: values.alias.trim(),
	description: values.description || undefined,
	email: values.email || undefined,
	phone: values.phone || undefined,
	address: values.address || undefined,
	rnc: values.rnc || undefined,
	userId: values.userId,
	countryId: values.countryId,
});

export const buildUpdateClientPayload = (
	values: ClientFormValues
): UpdateClientRequest => ({
	name: values.name.trim(),
	alias: values.alias.trim(),
	description: values.description,
	email: values.email,
	phone: values.phone,
	address: values.address,
	rnc: values.rnc,
	userId: values.userId,
	countryId: values.countryId,
	website: values.website || null,
	pocUserId: values.pocUserId,
	invoiceTemplateFileId: values.invoiceTemplateFileId,
});

export const buildClientThemePatch = (
	values: ClientFormValues,
	original?: ClientThemeModel
): UpdateClientThemeRequest | null => {
	const patch: UpdateClientThemeRequest = {};
	const nextPrimaryColor = values.primaryColor || null;
	const nextSecondaryColor = values.secondaryColor || null;
	const nextLogoFileId = values.logoFileId ?? null;

	if (values.brandName !== (original?.brandName ?? '')) {
		patch.brandName = values.brandName.trim() || null;
	}

	if (nextPrimaryColor !== (original?.primaryColor ?? null)) {
		patch.primaryColor = nextPrimaryColor;
	}

	if (nextSecondaryColor !== (original?.secondaryColor ?? null)) {
		patch.secondaryColor = nextSecondaryColor;
	}

	if (nextLogoFileId !== (original?.logoFileId ?? null)) {
		patch.logoFileId = nextLogoFileId;
	}

	return Object.keys(patch).length > 0 ? patch : null;
};

export const buildCoreSavedBaseline = (
	values: ClientFormValues,
	originalTheme?: ClientThemeModel
): ClientFormValues => ({
	...values,
	brandName: originalTheme?.brandName ?? '',
	primaryColor: originalTheme?.primaryColor ?? '',
	secondaryColor: originalTheme?.secondaryColor ?? '',
	logoFileId: originalTheme?.logoFileId ?? null,
	logoUrl: originalTheme?.logoUrl ?? null,
});
