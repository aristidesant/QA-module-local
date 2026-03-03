import { useEffect, useState } from 'react';
import { Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface SessionExpiringContentProps {
	initialSeconds: number;
	onExpire: () => void;
}

function formatMMSS(seconds: number): string {
	const m = Math.floor(Math.max(0, seconds) / 60);
	const s = Math.max(0, seconds) % 60;
	return `${m}:${String(s).padStart(2, '0')}`;
}

export function SessionExpiringContent({
	initialSeconds,
	onExpire,
}: SessionExpiringContentProps) {
	const { t } = useTranslation('common');
	const [remaining, setRemaining] = useState(initialSeconds);

	useEffect(() => {
		if (remaining <= 0) {
			onExpire();
			return;
		}

		const timer = setInterval(() => {
			setRemaining((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [remaining, onExpire]);

	return (
		<Stack gap='xs'>
			<Text size='sm'>{t('sessionExpiration.message')}</Text>
			<Text size='sm' c='red' fw={600}>
				{t('sessionExpiration.timer', { time: formatMMSS(remaining) })}
			</Text>
		</Stack>
	);
}

export default SessionExpiringContent;
