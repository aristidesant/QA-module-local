import {
	Avatar,
	Badge,
	Divider,
	Group,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { IconBan } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { formatDate } from '~/modules/qa/team/helpers';
import type { CustomerProfile } from '../types';
import { CHANNEL_META, SEGMENT_META, STATUS_META } from '../constants';
import { CustomerActions, type CustomerActionsProps } from './CustomerActions';
import { CustomerDetailsPopover } from './CustomerDetailsPopover';
import { HealthStrip } from './HealthStrip';

/** How many tags show beside the plan before "+N". */
const VISIBLE_TAGS = 2;

interface CustomerHeaderProps extends Omit<
	CustomerActionsProps,
	'size' | 'doNotCall'
> {
	profile: CustomerProfile;
}

export function CustomerHeader({
	profile,
	onAddNote,
	onToggleDnc,
}: CustomerHeaderProps) {
	const { t } = useTranslation('qa.customers');
	const { customer, kpis } = profile;
	const hiddenTags = Math.max(0, customer.tags.length - VISIBLE_TAGS);

	return (
		<SectionCard padding='lg'>
			<Stack gap='md'>
				<Group justify='space-between' align='flex-start' wrap='wrap'>
					<Group gap='md' align='flex-start' wrap='nowrap'>
						<Avatar size={56} radius='md' color='gray' name={customer.name} />
						<Stack gap={4}>
							<Group gap='xs'>
								<Title order={2}>{customer.name}</Title>
								<Badge variant='outline' color='gray'>
									{t(SEGMENT_META[customer.segment].labelKey)}
								</Badge>
								{customer.status !== 'active' && (
									<Badge variant='light' color='gray'>
										{t(STATUS_META[customer.status].labelKey)}
									</Badge>
								)}
								{customer.doNotCall && (
									<Badge
										color='red'
										variant='light'
										leftSection={<IconBan size={12} />}
									>
										{t('header.dnc')}
									</Badge>
								)}
							</Group>
							<Text size='sm' c='dimmed'>
								{customer.phone} ·{' '}
								{t('header.prefers', {
									channel: t(CHANNEL_META[customer.preferredChannel].labelKey),
								})}{' '}
								· {t(`header.language.${customer.language}`)} · {customer.city}
							</Text>
							<Group gap={6} wrap='wrap'>
								<Text size='xs' c='dimmed'>
									{t('header.plan')}: {customer.currentPlan}
									{customer.monthlyValue > 0 &&
										` · ${t('header.value', { value: `$${customer.monthlyValue}` })}`}
									{' · '}
									{t('header.customerSince', {
										date: formatDate(customer.customerSince),
									})}
									{' · '}
									{t('header.contacts', { count: kpis.totalContacts })}
								</Text>
								{customer.tags.slice(0, VISIBLE_TAGS).map((tag) => (
									<Badge key={tag} variant='light' color='gray' size='sm'>
										{tag}
									</Badge>
								))}
								{hiddenTags > 0 && (
									<Badge variant='outline' color='gray' size='sm'>
										+{hiddenTags}
									</Badge>
								)}
								<CustomerDetailsPopover customer={customer} />
							</Group>
						</Stack>
					</Group>

					<CustomerActions
						doNotCall={customer.doNotCall}
						onAddNote={onAddNote}
						onToggleDnc={onToggleDnc}
					/>
				</Group>

				<Divider />

				<HealthStrip profile={profile} />
			</Stack>
		</SectionCard>
	);
}
