import { useMemo, useState } from 'react';
import {
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from 'react-router';
import { useTranslation } from 'react-i18next';
import {
	Anchor,
	Avatar,
	Box,
	Breadcrumbs,
	Button,
	Group,
	Modal,
	Stack,
	Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ContentContainer } from '~/components/ContentContainer';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import {
	CompactProfileBar,
	ProfileNav,
	useCompactBar,
} from '~/modules/qa/components/ProfileShell';
import { useCustomersStore, selectCustomer } from '~/stores/qa/customersStore';
import { useSettingsStore, selectThresholds } from '~/stores/qa/settingsStore';
import { customersBasePath, roleFromPath } from '~/modules/qa/team/helpers';
import {
	CUSTOMER_TABS,
	CUSTOMER_TAB_GROUPS,
	type CustomerTab,
} from '../constants';
import { toCustomerRow } from '../helpers';
import { SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
import { CustomerHeader } from './CustomerHeader';
import { CustomerActions } from './CustomerActions';
import { customerAttention } from './attention';
import { OverviewTab } from './tabs/OverviewTab';
import { ContactsTab } from './tabs/ContactsTab';
import { SentimentTab } from './tabs/SentimentTab';
import { OffersTab } from './tabs/OffersTab';
import { SurveysTab } from './tabs/SurveysTab';
import { TimelineTab } from './tabs/TimelineTab';

const isCustomerTab = (value: string | null): value is CustomerTab =>
	CUSTOMER_TABS.some((x) => x.value === value);

export default function CustomerProfilePage() {
	const { t } = useTranslation('qa.customers');
	const navigate = useNavigate();
	const location = useLocation();
	const { customerId } = useParams<{ customerId: string }>();
	const role = roleFromPath(location.pathname);
	const profile = useCustomersStore(selectCustomer(customerId));
	const setDoNotCall = useCustomersStore((s) => s.setDoNotCall);
	const lowSentiment =
		useSettingsStore(selectThresholds).sentiment.lowSentimentIncident;
	const [searchParams, setSearchParams] = useSearchParams();
	const [dncModalOpen, setDncModalOpen] = useState(false);

	// The compact bar shows once the full header has scrolled out of the content area.
	const { headerRef, compact } = useCompactBar(profile?.customer.id);

	const rawTab = searchParams.get('tab');
	const tab: CustomerTab = isCustomerTab(rawTab) ? rawTab : 'overview';
	const setTab = (value: CustomerTab) => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				next.set('tab', value);
				next.delete('focus');
				return next;
			},
			{ replace: true }
		);
	};

	const attention = useMemo(
		() => (profile ? customerAttention(profile, lowSentiment) : {}),
		[profile, lowSentiment]
	);

	const navGroups = useMemo(
		() =>
			CUSTOMER_TAB_GROUPS.map((g) => ({
				value: g.value,
				label: t(g.labelKey),
				icon: g.icon,
				tabs: g.tabs.map((value) => ({
					value,
					label: t(`tabs.${value}`),
					icon: CUSTOMER_TABS.find((x) => x.value === value)?.icon,
				})),
			})),
		[t]
	);

	const notVisible =
		profile &&
		role === 'supervisor' &&
		!toCustomerRow(profile).teamIds.includes(SUPERVISOR_PERSONA.id);

	if (!profile || notVisible) {
		return (
			<ContentContainer contentWidth='full'>
				<EmptyState
					message={t('common.notFound')}
					description={t('common.notFoundDescription', { id: customerId })}
					action={
						<Button onClick={() => navigate(customersBasePath(role))}>
							{t('header.back')}
						</Button>
					}
				/>
			</ContentContainer>
		);
	}

	const handleAddNoteClick = () => {
		setSearchParams(
			(prev) => {
				const next = new URLSearchParams(prev);
				next.set('tab', 'timeline');
				next.set('focus', 'note');
				return next;
			},
			{ replace: true }
		);
	};

	const handleConfirmDnc = () => {
		setDoNotCall(profile.customer.id, !profile.customer.doNotCall, role);
		notifications.show({ color: 'teal', message: t('modals.dnc.success') });
		setDncModalOpen(false);
	};

	const renderTab = () => {
		switch (tab) {
			case 'contacts':
				return <ContactsTab profile={profile} />;
			case 'sentiment':
				return <SentimentTab profile={profile} />;
			case 'offers':
				return <OffersTab profile={profile} />;
			case 'surveys':
				return <SurveysTab profile={profile} />;
			case 'timeline':
				return (
					<TimelineTab
						profile={profile}
						role={role}
						autoFocusNote={searchParams.get('focus') === 'note'}
					/>
				);
			default:
				return <OverviewTab profile={profile} />;
		}
	};

	return (
		<ContentContainer
			contentWidth='full'
			showBackButton
			onBackClick={() => navigate(customersBasePath(role))}
		>
			<CompactProfileBar
				visible={compact}
				actions={
					<CustomerActions
						size='xs'
						doNotCall={profile.customer.doNotCall}
						onAddNote={handleAddNoteClick}
						onToggleDnc={() => setDncModalOpen(true)}
					/>
				}
			>
				<Avatar
					size={32}
					radius='md'
					color='gray'
					name={profile.customer.name}
				/>
				<Text fw={600} truncate>
					{profile.customer.name}
				</Text>
				<Text fw={700}>{profile.kpis.receptivenessScore}</Text>
				<Text size='sm' c='dimmed' visibleFrom='sm'>
					{t('header.receptiveness')}
				</Text>
			</CompactProfileBar>
			<Stack gap='lg'>
				<Breadcrumbs>
					<Anchor onClick={() => navigate(customersBasePath(role))}>
						{t('list.title')}
					</Anchor>
					<Text c='dimmed'>{profile.customer.name}</Text>
				</Breadcrumbs>

				<div ref={headerRef}>
					<CustomerHeader
						profile={profile}
						onAddNote={handleAddNoteClick}
						onToggleDnc={() => setDncModalOpen(true)}
					/>
				</div>

				<ProfileNav
					groups={navGroups}
					tab={tab}
					onChange={setTab}
					attention={attention}
					attentionLabel={t('tabs.attention')}
				/>

				<Box role='tabpanel' pt='md'>
					{renderTab()}
				</Box>
			</Stack>

			<Modal
				opened={dncModalOpen}
				onClose={() => setDncModalOpen(false)}
				title={t(
					profile.customer.doNotCall
						? 'modals.dnc.removeTitle'
						: 'modals.dnc.title'
				)}
				centered
			>
				<Stack gap='md'>
					<Text size='sm'>
						{t(
							profile.customer.doNotCall
								? 'modals.dnc.removeBody'
								: 'modals.dnc.body'
						)}
					</Text>
					<Group justify='flex-end'>
						<Button variant='default' onClick={() => setDncModalOpen(false)}>
							{t('modals.cancel')}
						</Button>
						<Button color='red' onClick={handleConfirmDnc}>
							{t(
								profile.customer.doNotCall
									? 'modals.dnc.removeConfirm'
									: 'modals.dnc.confirm'
							)}
						</Button>
					</Group>
				</Stack>
			</Modal>
		</ContentContainer>
	);
}
