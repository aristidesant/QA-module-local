// Refactored to use Mantine's useForm for all form state and validation

import React, { useEffect } from 'react';
import { Stack, LoadingOverlay, Box, ActionIcon } from '@mantine/core';
import type { Campaign } from '../../../models/CampaignsModel';
import {
	useCreateCampaign,
	useUpdateCampaign,
	useAssignCampaignObjective,
} from '~/queries/campaignsQueries';
import { notifications } from '@mantine/notifications';
import {
	CampaignFormProvider,
	useCampaignForm,
} from '../campaignFormFunctions';
import CampaignTabs from '../CampaignTabs';
import { useCampaignsStore } from '~/stores/campaignsStore';
import GeneralSection from './GeneralSection/GeneralSection';
import SectionCard from '~/components/SectionCard';
import { ContactSection } from './ContactSection/ContactSection';
import ParametersSection from './ParametersSection';
import AgentSection from './AgentSection';
import DispositionSection from './DispositionSection';
import ConversationsSection from './ConversationsSection';
import DoNotCallSection from './DoNotCallSection';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { CampaignStatus } from '~/models/CampaignStatus';
import { modals } from '@mantine/modals';
import { IconCalculator } from '@tabler/icons-react';
import SchedulerCalculator from './ParametersSection/SchedulerCalculator';

interface CampaignsFormProps {
	campaign?: Partial<Campaign>;
	loading?: boolean;
	onBack?: () => void;
}

export const CampaignsForm: React.FC<CampaignsFormProps> = ({
	campaign,
	onBack,
}) => {
	const { selectedTab, rightComponent, resetView } = useCampaignsStore(
		(state) => state
	);
	const { mutateAsync: createCampaign, isPending: isCreating } =
		useCreateCampaign();
	const { mutateAsync: updateCampaign, isPending: isUpdating } =
		useUpdateCampaign();
	const { mutateAsync: assignObjective } = useAssignCampaignObjective();

	const defaultWorkingHours = {
		monday: { enabled: true, from: '09:00', to: '17:30' },
		tuesday: { enabled: true, from: '09:00', to: '17:30' },
		wednesday: { enabled: true, from: '09:00', to: '17:30' },
		thursday: { enabled: true, from: '09:00', to: '17:30' },
		friday: { enabled: true, from: '09:00', to: '17:30' },
		saturday: { enabled: false, from: '09:00', to: '17:30' },
		sunday: { enabled: false, from: '09:00', to: '17:30' },
	};

	const form = useCampaignForm({
		initialValues: {
			name: campaign?.name || '',
			agentName: campaign?.agentName || '',
			configId: campaign?.configId || '',
			description: campaign?.description || '',
			budget: campaign?.budget ?? 0,
			spent: campaign?.spent ?? 0,
			type: campaign?.type || 'OUTBOUND',
			status: campaign?.status || CampaignStatus.PENDING,
			userId: campaign?.userId ?? 0,
			promptId: campaign?.promptId ?? undefined,
			objectiveId: campaign?.objectiveId ?? undefined,
			voiceId: campaign?.voiceId ?? undefined,
			clientId: campaign?.clientId ?? 0,
			tags: campaign?.tags || [],
			workingHours: campaign?.workingHours || defaultWorkingHours,
			agentConfig: campaign?.agentConfig || {},
		},
		validate: {
			name: (value) => (value ? null : 'Name is required'),
			type: (value) => (value ? null : 'Type is required'),
			status: (value) => (value ? null : 'Status is required'),
			budget: (value) => (value >= 0 ? null : 'Budget must be 0 or more'),
			spent: (value) => (value >= 0 ? null : 'Spent must be 0 or more'),
			userId: (value) => (value >= 0 ? null : 'User ID must be 0 or more'),
			clientId: (value) => (value >= 0 ? null : 'Client ID must be 0 or more'),
		},
	});

	// Update form values when campaign prop changes (e.g., after wizard updates)
	useEffect(() => {
		if (campaign) {
			form.setValues({
				name: campaign.name || '',
				agentName: campaign.agentName || '',
				configId: campaign.configId || '',
				description: campaign.description || '',
				budget: campaign.budget ?? 0,
				spent: campaign.spent ?? 0,
				type: campaign.type || 'OUTBOUND',
				status: campaign.status || CampaignStatus.PENDING,
				userId: campaign.userId ?? 0,
				promptId: campaign.promptId ?? undefined,
				objectiveId: campaign.objectiveId ?? undefined,
				voiceId: campaign.voiceId ?? undefined,
				clientId: campaign.clientId ?? 0,
				tags: campaign.tags || [],
				workingHours: campaign.workingHours || defaultWorkingHours,
				agentConfig: campaign.agentConfig || {},
			});
		}
	}, [campaign]);

	const handleSubmit = async (
		value: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>
	) => {
		if (form.validate().hasErrors) {
			return;
		}

		try {
			// Clean up toolIds from agentConfig before sending
			const cleanedValue = { ...value };
			if (cleanedValue.agentConfig?.conversationConfig?.agent?.prompt) {
				const { toolIds, ...restPrompt } =
					cleanedValue.agentConfig.conversationConfig.agent.prompt;
				cleanedValue.agentConfig = {
					...cleanedValue.agentConfig,
					conversationConfig: {
						...cleanedValue.agentConfig.conversationConfig,
						agent: {
							...cleanedValue.agentConfig.conversationConfig.agent,
							prompt: restPrompt as any,
						},
					},
				};
			}

			let savedCampaign: Campaign;

			if (campaign?.id) {
				// Update existing campaign
				savedCampaign = await updateCampaign({
					data: value,
					id: `${campaign.id}`,
				});
			} else {
				// Create new campaign
				savedCampaign = await createCampaign(value);
			}

			// Handle objective assignment if an objective is selected
			if (value.objectiveId && savedCampaign.id) {
				try {
					await assignObjective({
						campaignId: savedCampaign.id,
						objectiveId: value.objectiveId,
					});
				} catch (objectiveError) {
					// Don't fail the whole operation if objective assignment fails
					notifications.show({
						title: 'Warning',
						message: 'Campaign saved but objective assignment failed.',
						color: 'yellow',
					});
				}
			}

			notifications.show({
				title: campaign?.id ? 'Campaign Updated' : 'Campaign Created',
				message: `Your campaign has been successfully ${campaign?.id ? 'updated' : 'created'}.`,
				color: 'green',
			});
		} catch (error) {
			notifications.show({
				title: 'Error',
				message: `Failed to ${campaign?.id ? 'update' : 'create'} campaign. Please try again.`,
				color: 'red',
			});
		}
	};

	return (
		<ContentContainer
			rightSection={rightComponent || <></>}
			onBackClick={() => {
				resetView();
				onBack?.();
			}}
			title={`Editing campaign`}
			description={`Manage settings and configurations for your campaign.`}
			showBackButton
		>
			<CampaignFormProvider form={form}>
				<LoadingOverlay visible={isCreating || isUpdating} />
				<Stack gap='xs'>
					<Box p='xs'>
						<CampaignTabs />
					</Box>
					{selectedTab === 'general' && (
						<form onSubmit={form.onSubmit(handleSubmit)}>
							<GeneralSection />
							<div />
						</form>
					)}
					{selectedTab === 'agents' && (
						<form onSubmit={form.onSubmit(handleSubmit)}>
							<AgentSection />
						</form>
					)}
					{selectedTab === 'contacts' && <ContactSection />}
					{selectedTab === 'outcomes' && <DispositionSection />}
					{selectedTab === 'conversations' && (
						<ConversationsSection campaignId={campaign?.id} />
					)}
					{selectedTab === 'do-not-call' && (
						<DoNotCallSection campaignId={campaign?.id} />
					)}
					{selectedTab === 'params' && (
						<SectionCard
							title='Working Hours'
							description='Define the days and time ranges during which your agents are allowed to make calls.'
							headerActions={
								<ActionIcon
									size='md'
									variant='subtle'
									onClick={() =>
										modals.open({
											title: 'Scheduler Calculator',
											fullScreen: true,
											children: <SchedulerCalculator />,
										})
									}
								>
									<IconCalculator size={18} />
								</ActionIcon>
							}
						>
							<ParametersSection
								workingHours={form.values.workingHours || {}}
								onChange={(day, field, value) => {
									const updatedHours = { ...form.values.workingHours };
									updatedHours[day] = { ...updatedHours[day], [field]: value };
									form.setFieldValue('workingHours', updatedHours);
								}}
								onCopyToAll={(sourceDay) => {
									const sourceHours = form.values.workingHours?.[sourceDay];
									if (!sourceHours) return;

									const updatedHours = { ...form.values.workingHours };
									Object.keys(updatedHours).forEach((day) => {
										updatedHours[day] = { ...sourceHours };
									});
									form.setFieldValue('workingHours', updatedHours);
								}}
							/>
						</SectionCard>
					)}
				</Stack>
			</CampaignFormProvider>
		</ContentContainer>
	);
};
