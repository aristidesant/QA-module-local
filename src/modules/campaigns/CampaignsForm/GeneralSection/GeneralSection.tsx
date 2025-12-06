import { useCampaignFormContext } from '../../campaignFormFunctions';
import {
	Button,
	Flex,
	NumberInput,
	Select,
	Textarea,
	TextInput,
} from '@mantine/core';
import { IconDeviceFloppy } from '@tabler/icons-react';
import SectionCard from '~/components/SectionCard';
import {
	useGetCampaignObjectives,
	useGetCampaignObjectiveById,
} from '~/queries/campaignObjectivesQueries';

const GeneralSection: React.FC = () => {
	const form = useCampaignFormContext();

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

				<Select
					label='Campaign Objective'
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
					description='Choose the main objective this campaign aims to achieve'
					error={loadError ? 'Failed to load objectives' : undefined}
				/>

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
		</>
	);
};

export default GeneralSection;
