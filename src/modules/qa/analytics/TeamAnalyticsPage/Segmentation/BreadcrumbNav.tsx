import { useTranslation } from 'react-i18next';
import { Breadcrumbs, Anchor, Button, Group } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';
import { useTeamAnalyticsStore } from '~/stores/qa/teamAnalyticsStore';
import type { DrillCrumb } from '../../types';

export default function BreadcrumbNav() {
	const { t } = useTranslation('qa.teamAnalytics');
	const { drill, drillTo, clearDrill } = useTeamAnalyticsStore();

	if (!drill) return null;

	const items = [
		<Anchor
			key='root'
			href='#'
			onClick={(e) => {
				e.preventDefault();
				clearDrill();
			}}
			size='sm'
		>
			{t('drill.root')}
		</Anchor>,
		...drill.path.map((crumb: DrillCrumb, idx: number) => (
			<Anchor
				key={`${idx}-${crumb.key}`}
				href='#'
				onClick={(e) => {
					e.preventDefault();
					drillTo(idx);
				}}
				size='sm'
			>
				{crumb.label}
			</Anchor>
		)),
	];

	return (
		<Group gap='md'>
			<Button
				leftSection={<IconChevronLeft size={16} />}
				variant='subtle'
				size='sm'
				onClick={() => clearDrill()}
			>
				{t('drill.back')}
			</Button>
			<Breadcrumbs>{items}</Breadcrumbs>
		</Group>
	);
}
