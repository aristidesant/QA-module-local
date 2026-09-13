import { Alert, Avatar, Badge, Button, Group, Stack, Text, Title, Tooltip } from '@mantine/core';
import { IconBan, IconBulb, IconCalendarEvent, IconClock, IconNote } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { TrendDelta } from '~/modules/qa/team/components/TrendDelta';
import { formatDate } from '~/modules/qa/team/helpers';
import type { TeamRole } from '~/modules/qa/team/types';
import type { CustomerProfile } from '../types';
import { CHANNEL_META, CHURN_META, SEGMENT_META, STATUS_META } from '../constants';
import { ReceptivenessGauge } from '../components/ReceptivenessGauge';
import { windowLabel } from '../helpers';

interface CustomerHeaderProps {
	profile: CustomerProfile;
	role: TeamRole;
	onFollowUp: () => void;
	onAddNote: () => void;
	onToggleDnc: () => void;
}

export function CustomerHeader({ profile, onFollowUp, onAddNote, onToggleDnc }: CustomerHeaderProps) {
	const { t } = useTranslation('qa.customers');
	const { customer, kpis, bestWindows } = profile;

	return (
		<SectionCard padding='lg'>
			<Group justify='space-between' align='flex-start' wrap='wrap'>
				<Group gap='md' align='flex-start'>
					<Avatar size={72} radius='md' color={customer.avatarColor} name={customer.name} />
					<Stack gap={4}>
						<Group gap='xs'>
							<Title order={2}>{customer.name}</Title>
							<Badge variant='light' color={SEGMENT_META[customer.segment].color}>{t(SEGMENT_META[customer.segment].labelKey)}</Badge>
							<Badge variant='dot' color={STATUS_META[customer.status].color}>{t(STATUS_META[customer.status].labelKey)}</Badge>
							{customer.doNotCall && <Badge color='red' variant='filled' leftSection={<IconBan size={12} />}>{t('header.dnc')}</Badge>}
						</Group>
						<Text size='sm' c='dimmed'>{customer.id} · {customer.phone} · {customer.email} · {customer.city}</Text>
						<Group gap={6}>
							<Badge variant='outline' size='xs'>{t('header.plan')}: {customer.currentPlan}</Badge>
							{customer.monthlyValue > 0 && <Badge size='xs' variant='outline'>{t('header.value', { value: `$${customer.monthlyValue}` })}</Badge>}
							<Badge variant='light' color='gray' size='xs'>{t('header.prefers', { channel: t(CHANNEL_META[customer.preferredChannel].labelKey) })}</Badge>
							<Badge size='xs'>{t(`header.language.${customer.language}`)}</Badge>
							{customer.tags.map((tag) => <Badge key={tag} size='xs' variant='light' color='indigo'>{tag}</Badge>)}
						</Group>
						<Text size='xs' c='dimmed'>
							{t('header.customerSince', { date: formatDate(customer.customerSince) })} · {t('header.trackedSince', { date: formatDate(customer.trackedSince) })} · {kpis.totalContacts} contacts
						</Text>
					</Stack>
				</Group>

				<Group gap='xl' align='center'>
					<ReceptivenessGauge score={kpis.receptivenessScore} band={kpis.receptivenessBand} />
					<Stack gap={6}>
						<Group gap='xs'>
							<Text size='xs' c='dimmed' tt='uppercase'>{t('header.churn')}</Text>
							<Badge color={CHURN_META[kpis.churnRisk].color} variant='filled'>{t(CHURN_META[kpis.churnRisk].labelKey)}</Badge>
						</Group>
						<Group gap='xs'>
							<Text size='xs' c='dimmed' tt='uppercase'>{t('header.bestWindow')}</Text>
							<Badge color='teal' variant='light' leftSection={<IconClock size={12} />}>
								{bestWindows[0] ? windowLabel(bestWindows[0], t) : '—'}
							</Badge>
						</Group>
						<TrendDelta delta={kpis.sentimentDelta} trend={kpis.sentimentTrend} unit='/5' suffix={t('common.vsFirst')} />
					</Stack>
				</Group>
			</Group>

			<Alert variant='light' color='blue' icon={<IconBulb size={16} />} title={t('header.nextBestAction')} mt='md'>
				{profile.nextBestAction}
			</Alert>

			<Group justify='flex-end' mt='sm'>
				<Tooltip label={customer.doNotCall ? t('header.dnc') : ''} disabled={!customer.doNotCall}>
					<Button variant='light' leftSection={<IconCalendarEvent size={16} />} onClick={onFollowUp} disabled={customer.doNotCall}>
						{t('header.actions.followUp')}
					</Button>
				</Tooltip>
				<Button variant='default' leftSection={<IconNote size={16} />} onClick={onAddNote}>
					{t('header.actions.addNote')}
				</Button>
				<Button variant={customer.doNotCall ? 'default' : 'outline'} color='red' leftSection={<IconBan size={16} />} onClick={onToggleDnc}>
					{t(customer.doNotCall ? 'header.actions.unflagDnc' : 'header.actions.flagDnc')}
				</Button>
			</Group>
		</SectionCard>
	);
}
