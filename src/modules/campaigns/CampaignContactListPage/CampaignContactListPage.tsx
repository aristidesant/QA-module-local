import { useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, Flex, Loader, Tabs, Text } from '@mantine/core';
import {
	IconAlertCircle,
	IconArrowLeft,
	IconInfoCircle,
	IconMessage,
	IconPlayerPause,
	IconPlayerPlay,
	IconRefresh,
	IconUsers,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { modals } from '@mantine/modals';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import { useGetContactGroup } from '~/queries/contactGroupQueries';
import {
	useStartOutboundCampaign,
	usePauseOutboundCampaign,
	useResumeOutboundCampaign,
} from '~/queries/campaignsQueries';
import { useCampaignContactListStore } from '~/stores/campaignContactListStore';
import ContactGroupSummary from './ContactGroupSummary';
import ContactGroupContactsTable from './ContactGroupContactsTable';
import ContactListInformation from './ContactListInformation';
import ContactListMetrics from './ContactListMetrics';
import ConversationsList from '~/modules/conversations/ConversationsList';
import ConversationDetails from '~/modules/conversations/ConversationDetails';
import FaultyPhonesAlert from './ContactGroupContactsTable/FaultyPhonesAlert';

const CampaignContactListPage = () => {
	const navigate = useNavigate();
	const { contactGroupId, campaignId } = useParams<{
		contactGroupId: string;
		campaignId: string;
	}>();

	const contactGroupIdNumber = useMemo(() => {
		if (!contactGroupId) {
			return Number.NaN;
		}
		const parsed = Number.parseInt(contactGroupId, 10);
		return Number.isNaN(parsed) ? Number.NaN : parsed;
	}, [contactGroupId]);

	const contactGroupQuery = useGetContactGroup(
		Number.isNaN(contactGroupIdNumber) ? 0 : contactGroupIdNumber
	);

	const startMutation = useStartOutboundCampaign();
	const pauseMutation = usePauseOutboundCampaign();
	const resumeMutation = useResumeOutboundCampaign();

	const { setRightComponent, rightComponent } = useCampaignContactListStore();

	useEffect(() => {
		if (contactGroupQuery.data) {
			setRightComponent(
				<ContactGroupSummary contactGroup={contactGroupQuery.data} />
			);
		} else {
			setRightComponent(null);
		}
	}, [contactGroupQuery.data, setRightComponent]);

	const isLoadingMutations =
		startMutation.isPending ||
		pauseMutation.isPending ||
		resumeMutation.isPending;

	type ActionType = 'start' | 'resume' | 'pause' | null;

	const statusConfig: Record<
		string,
		{
			actionLabel: string;
			actionIcon: React.ReactNode;
			actionType: ActionType;
		}
	> = {
		PENDING: {
			actionLabel: 'Start Campaign',
			actionIcon: <IconPlayerPlay size={16} />,
			actionType: 'start',
		},
		RUNNING: {
			actionLabel: 'Pause Campaign',
			actionIcon: <IconPlayerPause size={16} />,
			actionType: 'pause',
		},
		PAUSED: {
			actionLabel: 'Resume Campaign',
			actionIcon: <IconPlayerPlay size={16} />,
			actionType: 'resume',
		},
		COMPLETE: {
			actionLabel: 'No Actions Available',
			actionIcon: null,
			actionType: null,
		},
		FAILED: {
			actionLabel: 'Retry Not Available',
			actionIcon: null,
			actionType: null,
		},
		UNKNOWN: {
			actionLabel: 'No Actions Available',
			actionIcon: null,
			actionType: null,
		},
	};

	const statusKey = contactGroupQuery.data
		? (contactGroupQuery.data.queueStatus?.toUpperCase() ?? 'UNKNOWN')
		: 'UNKNOWN';
	const status = statusConfig[statusKey] ?? statusConfig.UNKNOWN;

	const handleAction = async () => {
		if (!contactGroupQuery.data) return;

		let confirmMessage = '';
		if (status.actionType === 'start') {
			confirmMessage =
				'Starting the campaign will begin calling contacts in this list. This action cannot be undone immediately. Are you sure you want to start?';
		} else if (status.actionType === 'pause') {
			confirmMessage =
				'Pausing the campaign will stop all ongoing calls. You can resume later. Are you sure you want to pause?';
		} else if (status.actionType === 'resume') {
			confirmMessage =
				'Resuming the campaign will continue calling contacts from where it left off. Are you sure you want to resume?';
		}

		const confirmed = await new Promise<boolean>((resolve) => {
			modals.openConfirmModal({
				title: 'Confirm Action',
				children: confirmMessage,
				labels: { confirm: 'Yes', cancel: 'No' },
				onConfirm: () => resolve(true),
				onCancel: () => resolve(false),
			});
		});

		if (!confirmed) {
			return;
		}

		const payload = {
			campaignId: contactGroupQuery.data.schedule?.campaignId || 0,
			contactGroupId: contactGroupQuery.data.id,
		};

		const mutationOptions = {
			onSuccess: () => {
				notifications.show({
					title: 'Success',
					message: `Campaign ${status.actionType}d successfully`,
					color: 'green',
				});
				void contactGroupQuery.refetch();
			},
			onError: (error: Error) => {
				notifications.show({
					title: 'Error',
					message: `Failed to ${status.actionType} campaign: ${error.message}`,
					color: 'red',
				});
			},
		};

		if (status.actionType === 'start') {
			startMutation.mutate(payload, mutationOptions);
		} else if (status.actionType === 'resume') {
			resumeMutation.mutate(payload, mutationOptions);
		} else if (status.actionType === 'pause') {
			pauseMutation.mutate(payload, mutationOptions);
		}
	};

	const primaryActionDisabled =
		status.actionType === null || isLoadingMutations;

	const isLoading = contactGroupQuery.isLoading;
	const hasInvalidId = Number.isNaN(contactGroupIdNumber);

	const commonContainerProps = {
		showBackButton: true,
		onBackClick: () => navigate(`/campaign/view/${campaignId}`),
	};

	if (hasInvalidId) {
		return (
			<ContentContainer
				{...commonContainerProps}
				title='Contact List Not Found'
				description='The contact list you are looking for could not be found.'
			>
				<EmptyState
					icon={<IconAlertCircle size={48} />}
					message='Invalid Contact List ID'
					description={
						<Text size='sm' c='dimmed' ta='center'>
							The contact list identifier in the URL is not valid. Please check
							the URL and try again, or return to the campaign overview to
							select a valid contact list.
						</Text>
					}
					action={
						<Button
							variant='light'
							leftSection={<IconArrowLeft size={16} />}
							onClick={() => navigate(`/campaign/view/${campaignId}`)}
						>
							Return to Campaign
						</Button>
					}
				/>
			</ContentContainer>
		);
	}

	if (isLoading) {
		return (
			<ContentContainer
				{...commonContainerProps}
				title='Loading Contact List'
				description='Fetching the latest information for this contact list.'
			>
				<Flex justify='center' align='center' style={{ minHeight: '320px' }}>
					<Loader size='lg' />
				</Flex>
			</ContentContainer>
		);
	}

	if (contactGroupQuery.isError || !contactGroupQuery.data) {
		const errorMessage =
			contactGroupQuery.error instanceof Error
				? contactGroupQuery.error.message
				: 'Unable to load contact list information';

		return (
			<ContentContainer
				{...commonContainerProps}
				title='Contact List Unavailable'
				description='We encountered an issue while loading this contact list.'
			>
				<EmptyState
					icon={<IconAlertCircle size={48} />}
					message='Unable to Load Contact List'
					description={
						<Text size='sm' c='dimmed' ta='center'>
							{errorMessage}. This could be due to a network issue, server
							problem, or the contact list may no longer exist.
						</Text>
					}
					action={
						<Button
							variant='light'
							leftSection={<IconRefresh size={16} />}
							onClick={async () => {
								try {
									await contactGroupQuery.refetch();
									notifications.show({
										title: 'Success',
										message: 'Contact list reloaded successfully',
										color: 'green',
									});
								} catch (error) {
									notifications.show({
										title: 'Error',
										message: `Failed to reload: ${(error as Error).message}`,
										color: 'red',
									});
								}
							}}
							loading={contactGroupQuery.isRefetching}
						>
							Try Again
						</Button>
					}
				/>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer
			{...commonContainerProps}
			title={contactGroupQuery.data.name}
			description='Review and manage the contacts associated with this list.'
			rightSection={rightComponent}
		>
			<Tabs variant='outline' defaultValue='overview' keepMounted={false}>
				<Tabs.List>
					<Tabs.Tab value='overview' leftSection={<IconInfoCircle size={16} />}>
						Overview
					</Tabs.Tab>
					<Tabs.Tab
						value='conversations'
						leftSection={<IconMessage size={16} />}
					>
						Conversations
					</Tabs.Tab>
					<Tabs.Tab value='contacts' leftSection={<IconUsers size={16} />}>
						Contacts
					</Tabs.Tab>
				</Tabs.List>

				<Tabs.Panel value='overview' pt='md'>
					<SectionCard
						title='Contact List Information'
						description='View the status and metrics for this contact list.'
						headerActions={
							<Button
								variant='filled'
								onClick={handleAction}
								disabled={primaryActionDisabled}
								loading={isLoadingMutations}
								leftSection={status.actionIcon}
							>
								{status.actionLabel}
							</Button>
						}
					>
						<ContactListInformation
							contactGroup={contactGroupQuery.data}
							onReload={() => contactGroupQuery.refetch()}
						/>
					</SectionCard>
					<ContactListMetrics contactGroupId={contactGroupId} />
				</Tabs.Panel>

				<Tabs.Panel value='conversations' pt='md'>
					<SectionCard
						title='Conversations'
						description='All conversations associated with this contact list.'
					>
						<ConversationsList
							onConversationClick={(conversation) => {
								setRightComponent(
									<ConversationDetails id={conversation?.id} />
								);
							}}
							contactGroupId={contactGroupId}
						/>
					</SectionCard>
				</Tabs.Panel>

				<Tabs.Panel value='contacts' pt='md'>
					<SectionCard
						title='Contacts'
						description='All contacts associated with this list.'
					>
						<FaultyPhonesAlert contactGroupId={contactGroupIdNumber} />
						<ContactGroupContactsTable
							contactGroupId={contactGroupIdNumber}
							campaignId={campaignId ? Number(campaignId) : undefined}
						/>
					</SectionCard>
				</Tabs.Panel>
			</Tabs>
		</ContentContainer>
	);
};

export default CampaignContactListPage;
