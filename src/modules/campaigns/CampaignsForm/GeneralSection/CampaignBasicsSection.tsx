import { Textarea, TextInput } from '@mantine/core';
import { IconRoute } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import { useCampaignFormContext } from '../../campaignFormFunctions';
import styles from './GeneralSection.module.css';

const CampaignBasicsSection = () => {
	const { t } = useTranslation('campaign.form.general');
	const form = useCampaignFormContext();

	return (
		<SectionCard
			title={t('general.title')}
			description={t('general.description')}
			icon={IconRoute}
			contentSpacing='sm'
		>
			<div className={styles.fieldGrid}>
				<TextInput
					className={styles.fullWidthField}
					label={t('general.campaignName')}
					placeholder={t('general.enterCampaignName')}
					required
					size='sm'
					{...form.getInputProps('name')}
				/>

				<Textarea
					className={styles.fullWidthField}
					{...form.getInputProps('description')}
					placeholder={t('general.describeYourCampaign')}
					label={t('general.descriptionLabel')}
					autosize
					minRows={4}
					size='sm'
				/>
			</div>
		</SectionCard>
	);
};

export default CampaignBasicsSection;
