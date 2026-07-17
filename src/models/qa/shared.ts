export interface PaginatedResponse<TData> {
	data: TData[];
	total: number;
	limit?: number;
	offset?: number;
}

export interface ListQueryParams {
	pagination?: boolean;
	limit?: number;
	offset?: number;
}
