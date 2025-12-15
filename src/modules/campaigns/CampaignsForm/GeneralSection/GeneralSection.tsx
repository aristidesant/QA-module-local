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

const GeneralSection: React.FC = () => {
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
				title='Basic Information'
				description='Define the core details of your campaign to ensure clarity and easy identification.'
			>
				<TextInput
					label='Campaign Name'
					placeholder='Enter campaign name'
					required
					{...form.getInputProps('name')}
				/>

				<Textarea
					{...form.getInputProps('description')}
					placeholder='Describe your campaign'
					label='Description'
					autosize
					minRows={5}
				/>

				<Input.Wrapper
					label='Campaign Objective'
					description='Choose the main objective this campaign aims to achieve'
					error={
						(form.errors.objectiveId as React.ReactNode) ||
						(loadError ? 'Failed to load objectives' : undefined)
					}
					withAsterisk
				>
					<Group gap='xs'>
						<Select
							placeholder={
								objectivesLoading
									? 'Loading objectives...'
									: 'Select an objective for this campaign'
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
						<Tooltip label='Create new objective'>
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
					label='Default Waves'
					description='How many waves should each new contact list run before stopping'
					min={1}
					clampBehavior='strict'
					allowDecimal={false}
					allowNegative={false}
					step={1}
					placeholder='Enter the number of waves'
					withAsterisk
					size='sm'
					{...form.getInputProps('defaultMaxWaves')}
				/>

				<Flex justify={'end'}>
					<Button leftSection={<IconDeviceFloppy />} type='submit'>
						Save
					</Button>
				</Flex>
			</SectionCard>

			<Modal
				opened={isObjectiveModalOpen}
				onClose={() => setIsObjectiveModalOpen(false)}
				title='Create Campaign Objective'
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
