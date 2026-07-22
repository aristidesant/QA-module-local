import { notifications } from '@mantine/notifications';

import { getErrorMessage } from '~/utils/httpClient';

export function notifySuccess(message: string) {
	notifications.show({ color: 'green', message });
}

export function notifyWarning(message: string) {
	notifications.show({ color: 'yellow', message });
}

export function notifyError(error: unknown) {
	notifications.show({ color: 'red', message: getErrorMessage(error) });
}
