import { ActionIcon, Badge, Group, Popover, Stack, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '~/modules/qa/team/helpers';
import type { CustomerRecord } from '../types';
import { CHANNEL_META } from '../constants';

interface CustomerDetailsPopoverProps {
	customer: CustomerRecord;
}

/** Everything about the customer that is not needed at a glance: contact data, plan, dates, consent and all tags. */
export function CustomerDetailsPopover({
	customer,
}: CustomerDetailsPopoverProps) {
	const { t } = useTranslation('qa.customers');
	const consent =
		[
			customer.consent.recording && t('header.details.recording'),
			customer.consent.marketing && t('header.details.marketing'),
		]
			.filter(Boolean)
			.join(' · ') || t('header.details.none');
	const rows = [
		{ label: t('header.details.id'), value: customer.id },
		{ label: t('header.details.email'), value: customer.email },
		{ label: t('header.details.city'), value: customer.city },
		{
			label: t('header.details.language'),
			value: t(`header.language.${customer.language}`),
		},
		{
			label: t('header.details.channel'),
			value: t(CHANNEL_META[customer.preferredChannel].labelKey),
		},
		{ label: t('header.details.plan'), value: customer.currentPlan },
		{
			label: t('header.details.value'),
			value: customer.monthlyValue > 0 ? `$${customer.monthlyValue}` : '—',
		},
		{
			label: t('header.details.customerSince'),
			value: formatDate(customer.customerSince),
		},
		{
			label: t('header.details.trackedSince'),
			value: formatDate(customer.trackedSince),
		},
		{ label: t('header.details.consent'), value: consent },
	];
	return (
		<Popover width={340} position='bottom-start' withArrow shadow='md'>
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
							<Text size='sm' ta='right'>
								{row.value}
							</Text>
						</Group>
					))}
					{customer.tags.length > 0 && (
						<Stack gap={4}>
							<Text size='xs' c='dimmed'>
								{t('header.details.tags')}
							</Text>
							<Group gap={6}>
								{customer.tags.map((tag) => (
									<Badge key={tag} variant='light' color='gray' size='sm'>
										{tag}
									</Badge>
								))}
							</Group>
						</Stack>
					)}
				</Stack>
			</Popover.Dropdown>
		</Popover>
	);
}
