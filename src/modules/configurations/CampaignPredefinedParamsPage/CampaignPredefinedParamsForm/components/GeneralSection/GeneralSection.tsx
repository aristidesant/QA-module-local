import { TextInput, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useFormContext } from '../../CampaignPredefinedFormProvider';

export const GeneralSection: React.FC = () => {
	const { form, isEditMode } = useFormContext();
	const { t } = useTranslation('campaign-predefined-params');

	return (
		<Stack gap='lg' mt='md'>
			<TextInput
				label={t('form.general.name.label')}
				placeholder={t('form.general.name.placeholder')}
				required
				{...form.getInputProps('name')}
				description={
					isEditMode
						? t('form.general.name.description.edit')
						: t('form.general.name.description.create')
				}
			/>
		</Stack>
	);
};

export default GeneralSection;
