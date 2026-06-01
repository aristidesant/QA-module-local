import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Select, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { IconAlertCircle, IconCheck, IconPhone } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
	linkInboundPhoneNumber,
	linkOutboundPhoneNumber,
	unlinkInboundPhoneNumber,
	unlinkOutboundPhoneNumber,
} from '~/api/phoneNumberApi';
import { useGetAgent } from '~/queries/agentQueries';
import { useGetCampaignAgents } from '~/queries/campaignAgentsQueries';
import { useSimplePhoneNumberList } from '~/queries/phoneNumberQueries';
import {
	useAgentConfigFormContext,
	useCampaignFormContext,
	useCampaignId,
} from '../../campaignFormFunctions';
import { normalizeCampaignType } from './GeneralSection.helpers';
import styles from './GeneralSection.module.css';

const PhoneNumberAssignment = () => {
	const { t } = useTranslation([
		'campaign.form.general',
		'campaign.form.agents',
		'common',
	]);
	const form = useCampaignFormContext();
	const agentConfigForm = useAgentConfigFormContext();
	const campaignId = useCampaignId();
	const queryClient = useQueryClient();
	const campaignType = normalizeCampaignType(form.values.type);
	const hasCampaign = Boolean(campaignId);

	const {
		data: campaignAgents,
		isLoading: isCampaignAgentsLoading,
		isError: isCampaignAgentsError,
	} = useGetCampaignAgents(campaignId || 0, hasCampaign);

	const agentId = campaignAgents?.[0]?.agentId;
	const {
		data: phoneNumbers,
		isLoading: isPhoneNumbersLoading,
		isError: isPhoneNumbersError,
	} = useSimplePhoneNumberList(
		{ type: campaignType },
		{ enabled: Boolean(agentId) }
	);
	const {
		data: agent,
		isLoading: isAgentLoading,
		isError: isAgentError,
	} = useGetAgent(agentId || '');

	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [currentLinkedId, setCurrentLinkedId] = useState<number | null>(null);
	const [isAssigning, setIsAssigning] = useState(false);

	useEffect(() => {
		if (!agent) {
			setCurrentLinkedId(null);
			setSelectedId(null);
			return;
		}

		const linkedId =
			campaignType === 'INBOUND'
				? agent.inboundPhoneNumberId
				: agent.outboundPhoneNumberId;

		setCurrentLinkedId(linkedId || null);
		setSelectedId(linkedId ? String(linkedId) : null);
	}, [agent, campaignType]);

	const phoneOptions = useMemo(
		() =>
			(phoneNumbers ?? []).map((phoneNumber) => ({
				value: String(phoneNumber.id),
				label: `${phoneNumber.label} (${phoneNumber.phoneNumber})`,
			})),
		[phoneNumbers]
	);

	const currentPhone = useMemo(
		() =>
			phoneNumbers?.find(
				(phoneNumber) => String(phoneNumber.id) === selectedId
			),
		[phoneNumbers, selectedId]
	);

	const isLoading =
		hasCampaign &&
		(isCampaignAgentsLoading ||
			Boolean(agentId && (isPhoneNumbersLoading || isAgentLoading)));
	const hasLoadError =
		isCampaignAgentsError || isPhoneNumbersError || isAgentError;
	const isUpdateMode = Boolean(currentLinkedId);
	const isButtonDisabled =
		!agentId ||
		!selectedId ||
		!currentPhone ||
		Boolean(currentLinkedId && selectedId === String(currentLinkedId));

	const helperMessage = !hasCampaign
		? t('general.phoneNumber.saveFirstHint')
		: !agentId && !isCampaignAgentsLoading
			? t('general.phoneNumber.agentRequiredHint')
			: !isPhoneNumbersLoading && phoneOptions.length === 0
				? t('general.phoneNumber.noNumbers')
				: t('general.phoneNumber.hint');

	const handleAssign = async () => {
		if (!agentId || !selectedId || !currentPhone) {
			return;
		}

		setIsAssigning(true);
		try {
			if (currentLinkedId) {
				if (campaignType === 'INBOUND') {
					await unlinkInboundPhoneNumber(agentId);
				} else {
					await unlinkOutboundPhoneNumber(agentId);
				}
			}

			const params = {
				agentId,
				phoneNumberId: Number(selectedId),
			};

			if (campaignType === 'INBOUND') {
				await linkInboundPhoneNumber(params);
			} else {
				await linkOutboundPhoneNumber(params);
			}

			agentConfigForm.setFieldValue('phoneNumbers', [currentPhone.phoneNumber]);
			setCurrentLinkedId(Number(selectedId));
			await queryClient.invalidateQueries({ queryKey: ['agent', agentId] });

			notifications.show({
				title: t('status.success', { ns: 'common' }),
				message: t('form.agent.phoneNumber.assignSuccess', {
					ns: 'campaign.form.agents',
				}),
				color: 'green',
				icon: <IconCheck size={16} />,
			});
		} catch (error) {
			void error;
			notifications.show({
				title: t('errors.unknown', { ns: 'common' }),
				message: t('form.agent.phoneNumber.assignError', {
					ns: 'campaign.form.agents',
				}),
				color: 'red',
			});
		} finally {
			setIsAssigning(false);
		}
	};

	return (
		<Stack gap='xs'>
			{hasLoadError && (
				<Alert
					variant='light'
					color='red'
					icon={<IconAlertCircle size={16} />}
					title={t('general.phoneNumber.loadErrorTitle')}
				>
					{t('general.phoneNumber.loadErrorDescription')}
				</Alert>
			)}

			<div className={styles.assignmentBlock}>
				<div className={styles.assignmentHeader}>
					<Text className={styles.assignmentTitle}>
						{t('form.agent.phoneNumber.selectLabel', {
							ns: 'campaign.form.agents',
						})}
					</Text>
					<Text size='xs' c='dimmed' className={styles.assignmentHint}>
						{helperMessage}
					</Text>
				</div>

				<div className={styles.phoneControlRow}>
					<Select
						placeholder={t('form.agent.phoneNumber.selectPlaceholder', {
							ns: 'campaign.form.agents',
						})}
						data={phoneOptions}
						value={selectedId}
						onChange={setSelectedId}
						leftSection={<IconPhone size={16} />}
						searchable
						clearable
						disabled={
							!agentId ||
							isLoading ||
							isAssigning ||
							hasLoadError ||
							phoneOptions.length === 0
						}
						nothingFoundMessage={t('general.phoneNumber.noMatches')}
						size='sm'
					/>

					<Button
						onClick={handleAssign}
						loading={isAssigning}
						disabled={isButtonDisabled || isLoading || hasLoadError}
						size='sm'
						className={styles.phoneAction}
					>
						{isUpdateMode
							? t('form.agent.phoneNumber.update', {
									ns: 'campaign.form.agents',
								})
							: t('form.agent.phoneNumber.assign', {
									ns: 'campaign.form.agents',
								})}
					</Button>
				</div>
			</div>
		</Stack>
	);
};

export default PhoneNumberAssignment;
