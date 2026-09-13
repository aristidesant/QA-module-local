import { useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Anchor, Breadcrumbs, Button, Group, Modal, Stack, Tabs, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ContentContainer } from '~/components/ContentContainer';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { useCustomersStore, selectCustomer } from '~/stores/qa/customersStore';
import { customersBasePath, roleFromPath } from '~/modules/qa/team/helpers';
import { CUSTOMER_TABS, type CustomerTab } from '../constants';
import { toCustomerRow } from '../helpers';
import { SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
import { CustomerHeader } from './CustomerHeader';
import { OverviewTab } from './tabs/OverviewTab';
import { ContactsTab } from './tabs/ContactsTab';
import { SentimentTab } from './tabs/SentimentTab';
import { OffersTab } from './tabs/OffersTab';
import { SurveysTab } from './tabs/SurveysTab';
import { TimelineTab } from './tabs/TimelineTab';
import { ScheduleFollowUpModal } from '../components/modals/ScheduleFollowUpModal';

export default function CustomerProfilePage() {
	const { t } = useTranslation('qa.customers');
	const navigate = useNavigate();
	const location = useLocation();
	const { customerId } = useParams<{ customerId: string }>();
	const role = roleFromPath(location.pathname);
	const profile = useCustomersStore(selectCustomer(customerId));
	const setDoNotCall = useCustomersStore((s) => s.setDoNotCall);
	const [searchParams, setSearchParams] = useSearchParams();
	const [followUpOpen, setFollowUpOpen] = useState(false);
	const [dncModalOpen, setDncModalOpen] = useState(false);

	const tab = (searchParams.get('tab') as CustomerTab | null) ?? 'overview';
	const setTab = (value: string | null) => {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			if (value) next.set('tab', value);
			next.delete('focus');
			return next;
		}, { replace: true });
	};

	const notVisible = profile && role === 'supervisor' && !toCustomerRow(profile).teamIds.includes(SUPERVISOR_PERSONA.id);

	if (!profile || notVisible) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState
					message={t('common.notFound')}
					description={t('common.notFoundDescription', { id: customerId })}
					action={<Button onClick={() => navigate(customersBasePath(role))}>{t('header.back')}</Button>}
				/>
			</ContentContainer>
		);
	}

	const handleAddNoteClick = () => {
		setSearchParams((prev) => {
			const next = new URLSearchParams(prev);
			next.set('tab', 'timeline');
			next.set('focus', 'note');
			return next;
		}, { replace: true });
	};

	const handleConfirmDnc = () => {
		setDoNotCall(profile.customer.id, !profile.customer.doNotCall, role);
		notifications.show({ color: 'teal', message: t('modals.dnc.success') });
		setDncModalOpen(false);
	};

	return (
		<ContentContainer contentWidth='full' showBackButton onBackClick={() => navigate(customersBasePath(role))}>
			<Stack gap='lg'>
				<Breadcrumbs>
					<Anchor onClick={() => navigate(customersBasePath(role))}>{t('list.title')}</Anchor>
					<Text c='dimmed'>{profile.customer.name}</Text>
				</Breadcrumbs>

				<CustomerHeader
					profile={profile}
					role={role}
					onFollowUp={() => setFollowUpOpen(true)}
					onAddNote={handleAddNoteClick}
					onToggleDnc={() => setDncModalOpen(true)}
				/>

				<Tabs value={tab} onChange={setTab} keepMounted={false}>
					<Tabs.List>
						{CUSTOMER_TABS.map(({ value, labelKey, icon: Icon }) => (
							<Tabs.Tab key={value} value={value} leftSection={<Icon size={16} />}>
								{t(labelKey)}
							</Tabs.Tab>
						))}
					</Tabs.List>

					<Tabs.Panel value='overview' pt='md'><OverviewTab profile={profile} /></Tabs.Panel>
					<Tabs.Panel value='contacts' pt='md'><ContactsTab profile={profile} /></Tabs.Panel>
					<Tabs.Panel value='sentiment' pt='md'><SentimentTab profile={profile} /></Tabs.Panel>
					<Tabs.Panel value='offers' pt='md'><OffersTab profile={profile} /></Tabs.Panel>
					<Tabs.Panel value='surveys' pt='md'><SurveysTab profile={profile} /></Tabs.Panel>
					<Tabs.Panel value='timeline' pt='md'>
						<TimelineTab profile={profile} role={role} autoFocusNote={searchParams.get('focus') === 'note'} />
					</Tabs.Panel>
				</Tabs>
			</Stack>

			<ScheduleFollowUpModal
				customerId={profile.customer.id}
				role={role}
				defaultAgentId={profile.contacts[0]?.agentId}
				opened={followUpOpen}
				onClose={() => setFollowUpOpen(false)}
			/>

			<Modal
				opened={dncModalOpen}
				onClose={() => setDncModalOpen(false)}
				title={t(profile.customer.doNotCall ? 'modals.dnc.removeTitle' : 'modals.dnc.title')}
				centered
			>
				<Stack gap='md'>
					<Text size='sm'>{t(profile.customer.doNotCall ? 'modals.dnc.removeBody' : 'modals.dnc.body')}</Text>
					<Group justify='flex-end'>
						<Button variant='default' onClick={() => setDncModalOpen(false)}>{t('modals.cancel')}</Button>
						<Button color='red' onClick={handleConfirmDnc}>
							{t(profile.customer.doNotCall ? 'modals.dnc.removeConfirm' : 'modals.dnc.confirm')}
						</Button>
					</Group>
				</Stack>
			</Modal>
		</ContentContainer>
	);
}
