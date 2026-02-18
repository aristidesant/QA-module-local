import { useCampaignFormContext } from '../../campaignFormFunctions';
import { Textarea, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';

const GeneralSection: React.FC = () => {
	const { t } = useTranslation(['campaigns']);
	const form = useCampaignFormContext();

	return (
		<SectionCard
			title={t('general.title')}
			description={t('general.description')}
		>
			<TextInput
				label={t('general.campaignName')}
				placeholder={t('general.enterCampaignName')}
				required
				size='sm'
				{...form.getInputProps('name')}
			/>

			<Textarea
				{...form.getInputProps('description')}
				placeholder={t('general.describeYourCampaign')}
				label={t('general.descriptionLabel')}
				autosize
				minRows={5}
				size='sm'
			/>
		</SectionCard>
	);
};

export default GeneralSection;
