import { useTranslation } from 'react-i18next';
import { Button, Menu, Group } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { useTeamAnalyticsStore } from '~/stores/qa/teamAnalyticsStore';
import { GROUP_BY_OPTIONS } from '../../constants';

interface GroupBySelectorProps {
	role: 'supervisor' | 'qa-manager';
}

export default function GroupBySelector({ role }: GroupBySelectorProps) {
	const { t } = useTranslation('qa.teamAnalytics');
	const { groupBy, setGroupBy } = useTeamAnalyticsStore();

	const visibleOptions = GROUP_BY_OPTIONS.filter(
		(opt) => !opt.managerOnly || role === 'qa-manager'
	);

	const currentLabel = t(`filters.groupByOptions.${groupBy}`);

	return (
		<Menu withArrow>
			<Menu.Target>
				<Button
					rightSection={<IconChevronDown size={14} />}
					variant='light'
					size='sm'
				>
					{t('filters.groupBy')}: {currentLabel}
				</Button>
			</Menu.Target>

			<Menu.Dropdown>
				<Group gap={0}>
					{visibleOptions.map((option) => (
						<Menu.Item
							key={option.value}
							onClick={() => setGroupBy(option.value)}
						>
							{t(`filters.groupByOptions.${option.value}`)}
						</Menu.Item>
					))}
				</Group>
			</Menu.Dropdown>
		</Menu>
	);
}
