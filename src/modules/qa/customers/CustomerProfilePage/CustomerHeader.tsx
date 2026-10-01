import {
	Avatar,
	Badge,
	Button,
	Group,
	Stack,
	Text,
	Title,
} from '@mantine/core';
import { IconBan, IconNote } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { formatDate, trendDelta } from '~/modules/qa/team/helpers';
import type { TeamRole } from '~/modules/qa/team/types';
import type { CustomerProfile } from '../types';
import { CHANNEL_META, SEGMENT_META, STATUS_META } from '../constants';
import { ReceptivenessGauge } from '../components/ReceptivenessGauge';
import { windowLabel } from '../helpers';

interface CustomerHeaderProps {
	profile: CustomerProfile;
	role: TeamRole;
	onAddNote: () => void;
	onToggleDnc: () => void;
}

/** Red text is the only colour here, and only for what needs attention. Adapts to light and dark. */
const ALERT = 'var(--mantine-color-red-text)';

export function CustomerHeader({
	profile,
	onAddNote,
	onToggleDnc,
}: CustomerHeaderProps) {
	const { t } = useTranslation('qa.customers');
	const { customer, kpis, bestWindows } = profile;
	const highChurn = kpis.churnRisk === 'high';

	// Plan, value, channel, language and tags read as one quiet line instead of six coloured chips.
	const facts = [
		`${t('header.plan')}: ${customer.currentPlan}`,
		customer.monthlyValue > 0
			? t('header.value', { value: `$${customer.monthlyValue}` })
			: null,
		t('header.prefers', {
			channel: t(CHANNEL_META[customer.preferredChannel].labelKey),
		}),
		t(`header.language.${customer.language}`),
		...customer.tags,
	].filter(Boolean);

	return (
		<SectionCard padding='lg'>
			<Group justify='space-between' align='flex-start' wrap='wrap'>
				<Group gap='md' align='flex-start'>
					<Avatar size={72} radius='md' color='gray' name={customer.name} />
					<Stack gap={4}>
						<Group gap='sm' align='baseline'>
							<Title order={2}>{customer.name}</Title>
							<Text size='sm' c='dimmed'>
								{t(SEGMENT_META[customer.segment].labelKey)} ·{' '}
								{t(STATUS_META[customer.status].labelKey)}
							</Text>
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
							{customer.id} · {customer.phone} · {customer.email} ·{' '}
							{customer.city}
						</Text>
						<Text size='xs' c='dimmed'>
							{facts.join(' · ')}
						</Text>
						<Text size='xs' c='dimmed'>
							{t('header.customerSince', {
								date: formatDate(customer.customerSince),
							})}{' '}
							·{' '}
							{t('header.trackedSince', {
								date: formatDate(customer.trackedSince),
							})}{' '}
							· {kpis.totalContacts} contacts
						</Text>
					</Stack>
				</Group>

				<Group gap='xl' align='center'>
					<ReceptivenessGauge
						score={kpis.receptivenessScore}
						band={kpis.receptivenessBand}
					/>
					<Stack gap={6}>
						<Group gap='xs'>
							<Text size='xs' c='dimmed' tt='uppercase'>
								{t('header.churn')}
							</Text>
							<Text
								size='sm'
								fw={highChurn ? 600 : 400}
								c={highChurn ? ALERT : undefined}
							>
								{t(`churn.${kpis.churnRisk}`)}
							</Text>
						</Group>
						<Group gap='xs'>
							<Text size='xs' c='dimmed' tt='uppercase'>
								{t('header.bestWindow')}
							</Text>
							<Text size='sm'>
								{bestWindows[0] ? windowLabel(bestWindows[0], t) : '—'}
							</Text>
						</Group>
						<Text size='xs' c='dimmed'>
							{trendDelta(kpis.sentimentDelta, '/5')}/5 {t('common.vsFirst')}
						</Text>
					</Stack>
				</Group>
			</Group>

			<Group justify='flex-end' mt='sm'>
				<Button
					variant='default'
					leftSection={<IconNote size={16} />}
					onClick={onAddNote}
				>
					{t('header.actions.addNote')}
				</Button>
				<Button
					variant='default'
					leftSection={<IconBan size={16} />}
					onClick={onToggleDnc}
				>
					{t(
						customer.doNotCall
							? 'header.actions.unflagDnc'
							: 'header.actions.flagDnc'
					)}
				</Button>
			</Group>
		</SectionCard>
	);
}
