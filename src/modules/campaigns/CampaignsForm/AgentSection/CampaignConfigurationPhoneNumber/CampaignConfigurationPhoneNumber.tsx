import React, { useState, useEffect } from 'react';
import { Button, Select, Stack, Group, LoadingOverlay } from '@mantine/core';
import { IconPhone, IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import SectionCard from '~/components/SectionCard';
import {
	linkInboundPhoneNumber,
	linkOutboundPhoneNumber,
	unlinkInboundPhoneNumber,
	unlinkOutboundPhoneNumber,
} from '~/api/phoneNumberApi';
import { useCampaignFormContext } from '../../../campaignFormFunctions';
import { useSimplePhoneNumberList } from '~/queries/phoneNumberQueries';
import { useGetAgent } from '~/queries/agentQueries';

const CampaignConfigurationPhoneNumber: React.FC = () => {
	const { t } = useTranslation(['campaigns', 'common']);
	const form = useCampaignFormContext();
	const agentId = form.values.agentConfig?.agentId;
	const campaignType = form.values.type || 'OUTBOUND'; // Default to OUTBOUND if missing

	// Fetch phone numbers based on campaign type
	const { data: phoneNumbers, isLoading: isLoadingNumbers } =
		useSimplePhoneNumberList({
			type: campaignType,
		});

	// Fetch current agent configuration to know linked numbers
	const { data: agent, isLoading: isLoadingAgent } = useGetAgent(agentId || '');

	// State stores the ID (stringified) of the selected phone number
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [isAssigning, setIsAssigning] = useState(false);
	const [currentLinkedId, setCurrentLinkedId] = useState<number | null>(null);

	// Sync current linked ID from agent data
	useEffect(() => {
		if (agent) {
			const linkedId =
				campaignType === 'INBOUND'
					? agent.inboundPhoneNumberId
					: agent.outboundPhoneNumberId;
			setCurrentLinkedId(linkedId || null);

			// Pre-select the linked number if exists
			if (linkedId) {
				setSelectedId(linkedId.toString());
			} else {
				setSelectedId(null);
			}
		}
	}, [agent, campaignType]);

	const isUpdateMode = !!currentLinkedId;
	const buttonLabel = isUpdateMode
		? t('form.agent.phoneNumber.update', { ns: 'campaigns' })
		: t('form.agent.phoneNumber.assign', { ns: 'campaigns' });

	// Find current phone object based on selected ID
	const currentPhone = phoneNumbers?.find(
		(p) => p.id.toString() === selectedId
	);

	// Disabled if:
	// - No selection
	// - Selection matches the currently linked ID
	// - No agent ID
	const isButtonDisabled =
		!selectedId ||
		(currentLinkedId && selectedId === currentLinkedId.toString()) ||
		!agentId;

	const handleAssign = async () => {
		if (!agentId || !selectedId || !currentPhone) return;

		setIsAssigning(true);
		try {
			// If updating, unlink first
			if (currentLinkedId) {
				if (campaignType === 'INBOUND') {
					await unlinkInboundPhoneNumber(agentId);
				} else {
					await unlinkOutboundPhoneNumber(agentId);
				}
			}

			// Link new number
			const params = {
				agentId,
				phoneNumberId: parseInt(selectedId),
			};

			if (campaignType === 'INBOUND') {
				await linkInboundPhoneNumber(params);
			} else {
				await linkOutboundPhoneNumber(params);
			}

			// Update form state locally to reflect the change immediately
			form.setFieldValue('agentConfig.phoneNumbers', [
				currentPhone.phoneNumber,
			]);

			// Optimistically update local state to reflect new linkage
			setCurrentLinkedId(parseInt(selectedId));

			notifications.show({
				title: t('status.success', { ns: 'common' }),
				message: t('form.agent.phoneNumber.assignSuccess', { ns: 'campaigns' }),
				color: 'green',
				icon: <IconCheck size={16} />,
			});
		} catch (error) {
			console.error('Error assigning phone number:', error);
			notifications.show({
				title: t('errors.unknown', { ns: 'common' }),
				message: t('form.agent.phoneNumber.assignError', { ns: 'campaigns' }),
				color: 'red',
			});
		} finally {
			setIsAssigning(false);
		}
	};

	const selectData =
		phoneNumbers?.map((p) => ({
			value: p.id.toString(),
			label: `${p.label} (${p.phoneNumber})`,
		})) || [];

	return (
		<SectionCard
			icon={IconPhone}
			title={t('form.agent.phoneNumber.title', { ns: 'campaigns' })}
			description={t('form.agent.phoneNumber.description', { ns: 'campaigns' })}
		>
			<Stack gap='md' pos='relative'>
				<LoadingOverlay visible={isLoadingNumbers || isLoadingAgent} />
				<Group align='flex-end'>
					<Select
						label={t('form.agent.phoneNumber.selectLabel', { ns: 'campaigns' })}
						placeholder={t('form.agent.phoneNumber.selectPlaceholder', {
							ns: 'campaigns',
						})}
						data={selectData}
						value={selectedId}
						onChange={setSelectedId}
						style={{ flex: 1 }}
						searchable
						clearable
					/>
					<Button
						onClick={handleAssign}
						loading={isAssigning}
						disabled={isButtonDisabled}
					>
						{buttonLabel}
					</Button>
				</Group>
			</Stack>
		</SectionCard>
	);
};

export default CampaignConfigurationPhoneNumber;
