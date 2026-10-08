import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { TierTenure } from '../postCoaching';

/** "5 weeks" / "25+ weeks": how long the agent has been in their current performance group. */
export function TierTenureText({ tenure }: { tenure: TierTenure }) {
	const { t } = useTranslation('qa.coaching');
	if (!tenure.tier) {
		return (
			<Text size='sm' c='dimmed'>
				—
			</Text>
		);
	}
	return (
		<Text size='sm'>
			{tenure.atLeast
				? t('agents.tierTenure.weeksAtLeast', { count: tenure.weeks })
				: t('agents.tierTenure.weeks', { count: tenure.weeks })}
		</Text>
	);
}
