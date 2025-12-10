import { TextInput, Stack } from '@mantine/core';
import { useFormContext } from '../../CampaignPredefinedFormProvider';

export const GeneralSection: React.FC = () => {
	const { form, isEditMode } = useFormContext();

	return (
		<Stack gap='lg' mt='md'>
			<TextInput
				label='Parameter Name'
				placeholder='e.g., Fast response agent'
				required
				{...form.getInputProps('name')}
				description={
					isEditMode
						? 'Changing the name will create a new parameter'
						: 'Unique identifier for this configuration'
				}
			/>
		</Stack>
	);
};

export default GeneralSection;
