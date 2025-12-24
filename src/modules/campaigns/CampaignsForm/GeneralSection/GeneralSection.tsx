import { useState } from 'react';
import { useCampaignFormContext } from '../../campaignFormFunctions';
import {
	Button,
	Flex,
	NumberInput,
	Select,
	Textarea,
	TextInput,
	Modal,
	ActionIcon,
	Tooltip,
	Input,
	Group,
} from '@mantine/core';
import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import {
	useGetCampaignObjectives,
	useGetCampaignObjectiveById,
} from '~/queries/campaignObjectivesQueries';
import { CampaignObjectivesForm } from '~/modules/campaigns/CampaignManagementPage/Objectives/components/CampaignObjectivesForm/CampaignObjectivesForm';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

const GeneralSection: React.FC = () => {
	const { t } = useTranslation();
	const form = useCampaignFormContext();
	const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
	const queryClient = useQueryClient();

	// Fetch paginated (includes .data array)
	const {
		data: paginatedResp,
		isLoading: objectivesLoading,
		error: loadError,
	} = useGetCampaignObjectives({ active: true });

	const objectiveId = form.values.objectiveId;
	const { data: selectedObjective } = useGetCampaignObjectiveById(
		Number(objectiveId || 0),
		!!objectiveId
	);

	let objectives = Array.isArray(paginatedResp?.data)
		? [...paginatedResp!.data]
		: [];
	if (
		selectedObjective &&
		!objectives.find((o) => o.id === selectedObjective.id)
	) {
		objectives.push(selectedObjective);
	}

	// Build grouped data structure expected by Mantine:
	// [{ group: 'Group Name', items: [{ value, label }, ...] }]
	const grouped: Record<string, { value: string; label: string }[]> = {};
	objectives.forEach((o) => {
		if (!o) return;
		const groupName = o.category?.name || 'Uncategorized';
		if (!grouped[groupName]) grouped[groupName] = [];
		grouped[groupName].push({
			value: o.id.toString(),
			label: o.name || 'Unnamed Objective',
		});
	});
	const selectData = Object.entries(grouped).map(([group, items]) => ({
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
			<SectionCard
				title={t('campaigns.general.title')}
				description={t('campaigns.general.description')}
			>
				<TextInput
					label={t('campaigns.general.campaignName')}
					placeholder={t('campaigns.general.enterCampaignName')}
					required
					{...form.getInputProps('name')}
				/>

				<Textarea
					{...form.getInputProps('description')}
					placeholder={t('campaigns.general.describeYourCampaign')}
					label={t('campaigns.general.descriptionLabel')}
					autosize
					minRows={5}
				/>

				<Input.Wrapper
					label={t('campaigns.general.campaignObjective')}
					description={t('campaigns.general.campaignObjectiveDesc')}
					error={
						(form.errors.objectiveId as React.ReactNode) ||
						(loadError ? t('campaigns.general.failedToLoadObjectives') : undefined)
					}
					withAsterisk
				>
					<Group gap='xs'>
						<Select
							placeholder={
								objectivesLoading
									? t('campaigns.general.loadingObjectives')
									: t('campaigns.general.selectObjective')
							}
							data={selectData}
							value={form.values.objectiveId?.toString() || null}
							onChange={handleObjectiveChange}
							searchable
							clearable
							disabled={objectivesLoading}
							readOnly={false}
							error={!!form.errors.objectiveId || !!loadError}
							style={{ flex: 1 }}
						/>
						<Tooltip label={t('campaigns.general.createNewObjective')}>
							<ActionIcon
								variant='light'
								color='blue'
								size='lg'
								onClick={() => setIsObjectiveModalOpen(true)}
							>
								<IconPlus size={20} />
							</ActionIcon>
						</Tooltip>
					</Group>
				</Input.Wrapper>

				<NumberInput
					label={t('campaigns.general.defaultWaves')}
					description={t('campaigns.general.defaultWavesDesc')}
					min={1}
					clampBehavior='strict'
					allowDecimal={false}
					allowNegative={false}
					step={1}
					placeholder={t('campaigns.general.enterNumberOfWaves')}
					withAsterisk
					size='sm'
					{...form.getInputProps('defaultMaxWaves')}
				/>

				<Flex justify={'end'}>
					<Button leftSection={<IconDeviceFloppy />} type='submit'>
						{t('common.save')}
					</Button>
				</Flex>
			</SectionCard>

			<Modal
				opened={isObjectiveModalOpen}
				onClose={() => setIsObjectiveModalOpen(false)}
				title={t('campaigns.general.createObjectiveTitle')}
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

export default GeneralSection;
