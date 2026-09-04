import type {
	CallMarker,
	CallMarkerListQueryParams,
	CreateCallMarkerPayload,
	PaginatedResponse,
	UpdateCallMarkerPayload,
} from '~/models/qa';
import { qaHttpClient } from '~/api/qa/qaConfig';

export async function getCallMarkers(params?: CallMarkerListQueryParams) {
	const response = await qaHttpClient.get<PaginatedResponse<CallMarker>>(
		'/call-markers',
		{ params }
	);
	return response.data;
}

export async function createCallMarker(payload: CreateCallMarkerPayload) {
	const response = await qaHttpClient.post<CallMarker>('/call-markers', payload);
	return response.data;
}

export async function updateCallMarker(markerId: number, payload: UpdateCallMarkerPayload) {
	const response = await qaHttpClient.patch<CallMarker>(
		`/call-markers/${markerId}`,
		payload
	);
	return response.data;
}
