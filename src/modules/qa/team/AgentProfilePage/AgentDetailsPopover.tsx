import { ActionIcon, Badge, Group, Popover, Stack, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { RosterAgent } from '../types';
import { formatDate } from '../helpers';

interface AgentDetailsPopoverProps {
	agent: RosterAgent;
	campaignNames: string[];
}

function TagList({
	label,
	items,
	variant,
}: {
	label: string;
	items: string[];
	variant: 'outline' | 'light';
}) {
	return (
		<Stack gap={4}>
			<Text size='xs' c='dimmed'>
				{label}
			</Text>
			<Group gap={6}>
				{items.map((item) => (
					<Badge key={item} variant={variant} color='gray' size='sm'>
						{item}
					</Badge>
				))}
			</Group>
		</Stack>
	);
}

/** Everything about the agent that is not needed at a glance: ID, email, dates, all campaigns and skills. */
export function AgentDetailsPopover({
	agent,
	campaignNames,
}: AgentDetailsPopoverProps) {
	const { t } = useTranslation('qa.team');
	const rows = [
		{ label: t('header.details.id'), value: agent.id },
		{ label: t('header.details.email'), value: agent.email },
		{ label: t('header.details.hireDate'), value: formatDate(agent.hireDate) },
		{
			label: t('header.details.trackedSince'),
			value: formatDate(agent.trackedSince),
		},
	];
	return (
		<Popover width={320} position='bottom-start' withArrow shadow='md'>
			<Popover.Target>
				<ActionIcon
					variant='subtle'
					color='gray'
					size='sm'
					aria-label={t('header.details.open')}
				>
					<IconInfoCircle size={16} />
				</ActionIcon>
			</Popover.Target>
			<Popover.Dropdown>
				<Stack gap='sm'>
					{rows.map((row) => (
						<Group key={row.label} justify='space-between' wrap='nowrap'>
							<Text size='xs' c='dimmed'>
								{row.label}
							</Text>
							<Text size='sm'>{row.value}</Text>
						</Group>
					))}
					{campaignNames.length > 0 && (
						<TagList
							label={t('header.details.campaigns')}
							items={campaignNames}
							variant='outline'
						/>
					)}
					{agent.skills.length > 0 && (
						<TagList
							label={t('header.details.skills')}
							items={agent.skills}
							variant='light'
						/>
					)}
				</Stack>
			</Popover.Dropdown>
		</Popover>
	);
}
