import { useState } from 'react';
import {
	ActionIcon,
	Input,
	Modal,
	NumberInput,
	Select,
	Stack,
	Tooltip,
} from '@mantine/core';
import {
	IconAdjustments,
	IconLanguage,
	IconPlus,
	IconTarget,
} from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import RightSectionCard from '~/components/RightSectionCard';
import { CampaignObjectivesForm } from '~/modules/campaign-management/campaign-objectives/components/CampaignObjectivesForm/CampaignObjectivesForm';
import {
	useGetCampaignObjectiveById,
	useGetCampaignObjectives,
} from '~/queries/campaignObjectivesQueries';
import { useCampaignFormContext } from '../../../campaignFormFunctions';
import CampaignConfigurationPhoneNumber from '../../AgentSection/CampaignConfigurationPhoneNumber/CampaignConfigurationPhoneNumber';

const GeneralSectionRightPanel: React.FC = () => {
	const { t } = useTranslation([
		'campaign.form.general',
		'campaign.form.agents',
		'campaign.detail',
		'common',
	]);
	const form = useCampaignFormContext();
	const queryClient = useQueryClient();
	const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);

	const isOutbound = (form.values.type || 'OUTBOUND') !== 'INBOUND';

	const currentLanguage =
		form.values.agentConfig?.conversationConfig?.agent?.language || '';
	const languageOptions = [
		{
			value: 'en',
			label: t('form.agent.basic.languages.en', {
				ns: 'campaign.form.agents',
			}),
		},
		{
			value: 'es',
			label: t('form.agent.basic.languages.es', {
				ns: 'campaign.form.agents',
			}),
		},
	];

	const handleLanguageChange = (value: string | null) => {
		if (value) {
			form.setFieldValue(
				'agentConfig.conversationConfig.agent.language',
				value
			);
		}
	};

	const {
		data: paginatedResp,
		isLoading: objectivesLoading,
		error: loadError,
	} = useGetCampaignObjectives({ active: true, limit: 9999 });

	const objectiveId = form.values.objectiveId;
	const { data: selectedObjective } = useGetCampaignObjectiveById(
		Number(objectiveId || 0),
		!!objectiveId
	);

	const objectives = Array.isArray(paginatedResp?.data)
		? [...paginatedResp.data]
		: [];

	if (
		selectedObjective &&
		!objectives.find((objective) => objective.id === selectedObjective.id)
	) {
		objectives.push(selectedObjective);
	}

	const grouped: Record<string, { value: string; label: string }[]> = {};
	objectives.forEach((objective) => {
		const groupName = objective.category?.name || 'Uncategorized';
		if (!grouped[groupName]) {
			grouped[groupName] = [];
		}

		grouped[groupName].push({
			value: objective.id.toString(),
			label: objective.name || 'Unnamed Objective',
		});
	});

	const objectiveSelectData = Object.entries(grouped).map(([group, items]) => ({
		group,
		items,
	}));

	const handleObjectiveChange = (value: string | null) => {
		if (!value) {
			form.setFieldValue('objectiveId', undefined);
			return;
		}

		form.setFieldValue('objectiveId', parseInt(value, 10));
	};

	const handleObjectiveCreated = () => {
		setIsObjectiveModalOpen(false);
		queryClient.invalidateQueries({ queryKey: ['campaignObjectives'] });
	};

	return (
		<>
			<Stack gap='xs'>
				<CampaignConfigurationPhoneNumber />

				{isOutbound && (
					<RightSectionCard
						title={t('general.campaignObjective')}
						description={t('general.campaignObjectiveDesc')}
						icon={IconTarget}
						iconColor='orange'
						rightSection={
							<Tooltip label={t('general.createNewObjective')}>
								<ActionIcon
									variant='light'
									color='orange'
									size='sm'
									onClick={() => setIsObjectiveModalOpen(true)}
								>
									<IconPlus size={16} />
								</ActionIcon>
							</Tooltip>
						}
					>
						<Input.Wrapper
							error={
								(form.errors.objectiveId as React.ReactNode) ||
								(loadError ? t('general.failedToLoadObjectives') : undefined)
							}
						>
							<Select
								placeholder={
									objectivesLoading
										? t('general.loadingObjectives')
										: t('general.selectObjective')
								}
								data={objectiveSelectData}
								value={form.values.objectiveId?.toString() || null}
								onChange={handleObjectiveChange}
								searchable
								clearable
								disabled={objectivesLoading}
								readOnly={false}
								error={!!form.errors.objectiveId || !!loadError}
								size='sm'
							/>
						</Input.Wrapper>
					</RightSectionCard>
				)}

				<RightSectionCard
					title={t('general.settingsTitle', {
						defaultValue: 'Campaign settings',
					})}
					description={t('general.settingsDescription', {
						defaultValue: 'Define language and wave limits',
					})}
					icon={IconAdjustments}
					iconColor='blue'
				>
					{isOutbound && (
						<>
							<NumberInput
								label={t('general.defaultWaves')}
								description={t('general.defaultWavesDesc')}
								min={1}
								clampBehavior='strict'
								allowDecimal={false}
								allowNegative={false}
								step={1}
								placeholder={t('general.enterNumberOfWaves')}
								withAsterisk
								size='sm'
								{...form.getInputProps('defaultMaxWaves')}
							/>

							<NumberInput
								label={t('general.defaultWaveDelay')}
								description={t('general.defaultWaveDelayDesc')}
								min={0}
								clampBehavior='strict'
								allowDecimal={false}
								allowNegative={false}
								step={30}
								placeholder={t('general.enterWaveDelaySeconds')}
								size='sm'
								{...form.getInputProps('defaultWaveExecutionDelaySeconds')}
							/>
						</>
					)}

					<Select
						label={t('form.agent.basic.language', {
							ns: 'campaign.form.agents',
						})}
						placeholder={t('form.agent.basic.languagePlaceholder', {
							ns: 'campaign.form.agents',
						})}
						value={currentLanguage}
						onChange={handleLanguageChange}
						data={languageOptions}
						description={t('form.agent.basic.languageDescription', {
							ns: 'campaign.form.agents',
						})}
						searchable
						nothingFoundMessage={t('form.agent.basic.noLanguageFound', {
							ns: 'campaign.form.agents',
						})}
						leftSection={<IconLanguage size={14} />}
						size='sm'
					/>
				</RightSectionCard>
			</Stack>

			<Modal
				opened={isObjectiveModalOpen}
				onClose={() => setIsObjectiveModalOpen(false)}
				title={t('general.createObjectiveTitle')}
				centered
			>
				<CampaignObjectivesForm
					onSuccess={handleObjectiveCreated}
					onCancel={() => setIsObjectiveModalOpen(false)}
				/>
			</Modal>
		</>
	);
};

export default GeneralSectionRightPanel;
