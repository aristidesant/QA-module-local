export type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE';

export interface ErrorTypeFormValues {
	code: string;
	label: string;
	description: string;
	isActive: boolean;
}
