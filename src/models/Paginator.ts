export interface Paginator<TData> {
	data: TData[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}
