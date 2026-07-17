import { isApiError } from '~/utils/httpClient';

export function isDuplicateCodeError(error: unknown) {
	if (!isApiError(error)) return false;

	const message = error.response.data.message;
	const messages = Array.isArray(message) ? message : [message];

	return messages.some((value) =>
		value?.includes('Error type code already exists')
	);
}
