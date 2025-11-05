import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, Flex, Loader, Text } from '@mantine/core';
import {
	IconAlertCircle,
	IconArrowLeft,
	IconPlayerPause,
	IconPlayerPlay,
	IconRefresh,
} from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import SectionCard from '~/components/SectionCard';
import EmptyState from '~/components/EmptyState';
import { useGetContactGroup } from '~/queries/contactGroupQueries';
import {
	useStartOutboundCampaign,
	usePauseOutboundCampaign,
	useResumeOutboundCampaign,
} from '~/queries/campaignsQueries';
import ContactGroupSummary from './ContactGroupSummary';
import ContactGroupContactsTable from './ContactGroupContactsTable';
import ContactListInformation from './ContactListInformation';

const CampaignContactListPage = () => {
	const navigate = useNavigate();
	const { contactGroupId } = useParams<{ contactGroupId: string }>();

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

	const handleAction = () => {
		if (!contactGroupQuery.data) return;
		const payload = {
			campaignId: contactGroupQuery.data.campaignId,
			contactGroupId: contactGroupQuery.data.id,
		};

		const mutationOptions = {
			onSuccess: () => {
				void contactGroupQuery.refetch();
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
		onBackClick: () => navigate('/campaign/47'),
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
							onClick={() => navigate('/campaign/47')}
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
							onClick={() => contactGroupQuery.refetch()}
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
			rightSection={
				<ContactGroupSummary contactGroup={contactGroupQuery.data} />
			}
		>
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
			<SectionCard
				title='Contacts'
				description='All contacts associated with this list.'
			>
				<ContactGroupContactsTable contactGroupId={contactGroupIdNumber} />
			</SectionCard>
		</ContentContainer>
	);
};

export default CampaignContactListPage;
