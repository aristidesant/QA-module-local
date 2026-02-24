import { useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import { modals } from '@mantine/modals';
import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { refreshAccessToken } from '~/api/authApi';
import { useSessionStore } from '~/stores/sessionStore';
import { logout } from '~/utils/logout';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const WARNING_THRESHOLD_SECONDS = 120;
const POLL_INTERVAL_MS = 30_000;

export function useSessionExpirationWatcher() {
	const { t } = useTranslation('common');
	const { setToken, setRefreshToken } = useSessionStore();
	const isModalOpenRef = useRef(false);

	useEffect(() => {
		const checkExpiration = async () => {
			const accessToken = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
			if (!accessToken || isModalOpenRef.current) return;

			try {
				const decoded = jwtDecode<{ exp?: number }>(accessToken);
				const expSeconds = decoded?.exp;
				if (!expSeconds) return;

				const remainingSeconds = dayjs(expSeconds * 1000).diff(
					dayjs(),
					'second'
				);
				if (remainingSeconds > WARNING_THRESHOLD_SECONDS) return;

				isModalOpenRef.current = true;

				modals.openConfirmModal({
					title: t('sessionExpiration.title'),
					children: <Text size='sm'>{t('sessionExpiration.message')}</Text>,
					labels: {
						confirm: t('sessionExpiration.confirm'),
						cancel: t('sessionExpiration.cancel'),
					},
					onConfirm: async () => {
						isModalOpenRef.current = false;
						const storedRefreshToken =
							window.sessionStorage.getItem(REFRESH_TOKEN_KEY);
						if (!storedRefreshToken) {
							logout('/login', { reason: 'expired' });
							return;
						}
						try {
							const response = await refreshAccessToken(storedRefreshToken);
							setToken(response.accessToken);
							setRefreshToken(response.refreshToken);
						} catch {
							logout('/login', { reason: 'expired' });
						}
					},
					onCancel: () => {
						isModalOpenRef.current = false;
					},
					closeOnClickOutside: false,
					closeOnEscape: false,
				});
			} catch {
				// Ignore malformed token errors
			}
		};

		checkExpiration();
		const intervalId = setInterval(checkExpiration, POLL_INTERVAL_MS);

		return () => {
			clearInterval(intervalId);
		};
	}, [t, setToken, setRefreshToken]);
}
