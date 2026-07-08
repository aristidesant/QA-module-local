import type { TablerIcon } from '@tabler/icons-react';

export type ClientFormMode = 'create' | 'edit';

export interface ClientFormValues {
	name: string;
	alias: string;
	description: string;
	email: string;
	phone: string;
	address: string;
	rnc: string;
	userId: number | null;
	countryId: number | null;
	website: string;
	pocUserId: number | null;
	invoiceTemplateFileId: number | null;
	brandName: string;
	primaryColor: string;
	secondaryColor: string;
	logoFileId: number | null;
	logoUrl: string | null;
}

export type ClientFormField = keyof ClientFormValues;

export type ClientFormSectionId =
	| 'identity'
	| 'contact'
	| 'location-tax'
	| 'billing'
	| 'branding';

export interface ClientFormSectionItem {
	id: ClientFormSectionId;
	label: string;
	icon: TablerIcon;
	hasError: boolean;
}
