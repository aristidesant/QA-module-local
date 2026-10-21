import React from 'react';
import { Group, Text } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

/** Dimmed "Last week" tag for dashboard cards whose data is not governed by the Performance Score period control. */
export const LastWeekLabel: React.FC = () => {
	const { t } = useTranslation('qa.dashboard');

	return (
		<Group gap={4} wrap='nowrap' c='dimmed'>
			<IconCalendar size={14} />
			<Text size='xs' c='dimmed'>
				{t('performanceScore.period.week')}
			</Text>
		</Group>
	);
};

export default LastWeekLabel;
