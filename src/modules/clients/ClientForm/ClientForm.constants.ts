import {
	DEFAULT_PRIMARY_COLOR,
	DEFAULT_SECONDARY_COLOR,
} from '~/utils/clientTheme';
import type {
	ClientFormField,
	ClientFormSectionId,
	ClientFormValues,
} from './ClientForm.types';

export const CLIENT_FORM_ID = 'client-form';

export const CLIENT_FORM_INITIAL_VALUES: ClientFormValues = {
	name: '',
	alias: '',
	description: '',
	email: '',
	phone: '',
	address: '',
	rnc: '',
	userId: null,
	countryId: null,
	website: '',
	pocUserId: null,
	invoiceTemplateFileId: null,
	brandName: '',
	primaryColor: DEFAULT_PRIMARY_COLOR,
	secondaryColor: DEFAULT_SECONDARY_COLOR,
	logoFileId: null,
	logoUrl: null,
};

export const CLIENT_FORM_FIELD_IDS: Record<ClientFormField, string> = {
	name: 'client-name',
	alias: 'client-alias',
	description: 'client-description',
	email: 'client-email',
	phone: 'client-phone',
	address: 'client-address',
	rnc: 'client-rnc',
	userId: 'client-user-id',
	countryId: 'client-country-id',
	website: 'client-website',
	pocUserId: 'client-poc-user-id',
	invoiceTemplateFileId: 'client-invoice-template-file-id',
	brandName: 'client-brand-name',
	primaryColor: 'client-primary-color',
	secondaryColor: 'client-secondary-color',
	logoFileId: 'client-logo-file-id',
	logoUrl: 'client-logo-url',
};

export const CLIENT_FORM_FIELD_ORDER: readonly ClientFormField[] = [
	'name',
	'alias',
	'description',
	'email',
	'phone',
	'address',
	'rnc',
	'website',
	'pocUserId',
	'invoiceTemplateFileId',
	'brandName',
	'primaryColor',
	'secondaryColor',
];

export const CLIENT_SECTION_FIELDS: Record<
	ClientFormSectionId,
	readonly ClientFormField[]
> = {
	identity: ['name', 'alias', 'description'],
	contact: ['email', 'phone'],
	'location-tax': ['address', 'rnc'],
	billing: ['website', 'pocUserId', 'invoiceTemplateFileId'],
	branding: ['brandName', 'primaryColor', 'secondaryColor', 'logoFileId'],
};

export const CLIENT_CREATE_OPTIONAL_FIELDS: readonly ClientFormField[] = [
	'email',
	'phone',
	'address',
	'rnc',
];
