export interface ClientThemeModel {
	primaryColor: string;
	secondaryColor: string;
	logoFileId: number | null;
	logoUrl: string | null;
	brandName: string | null;
	extras?: Record<string, unknown>;
}

export type UpdateClientThemeRequest = {
	primaryColor?: string | null;
	secondaryColor?: string | null;
	logoFileId?: number | null;
	brandName?: string | null;
};
