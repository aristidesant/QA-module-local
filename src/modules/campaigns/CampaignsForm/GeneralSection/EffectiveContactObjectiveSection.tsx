import { Text, Textarea, ThemeIcon } from '@mantine/core';
import { IconBulb } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useCampaignFormContext } from '../../campaignFormFunctions';
import styles from './GeneralSection.module.css';

const EffectiveContactObjectiveSection = () => {
	const { t } = useTranslation('campaign.form.general');
	const form = useCampaignFormContext();

	return (
		<section className={styles.subsection}>
			<div className={styles.subsectionHeader}>
				<h6 className={styles.subsectionTitle}>
					{t('general.effectiveContactObjective.title')}
				</h6>
			</div>

			<div className={styles.classificationGuidance}>
				<ThemeIcon
					variant='light'
					color='green'
					size='md'
					className={styles.classificationGuidanceIcon}
				>
					<IconBulb size={17} />
				</ThemeIcon>
				<div>
					<Text className={styles.classificationGuidanceTitle}>
						{t('general.effectiveContactObjective.guidanceTitle')}
					</Text>
					<Text className={styles.classificationGuidanceText}>
						{t('general.effectiveContactObjective.guidance')}
					</Text>
				</div>
			</div>

			<Textarea
				label={t('general.effectiveContactObjective.label')}
				placeholder={t('general.effectiveContactObjective.placeholder')}
				autosize
				minRows={5}
				maxRows={10}
				size='sm'
				{...form.getInputProps('effectiveContactObjective')}
			/>
		</section>
	);
};

export default EffectiveContactObjectiveSection;
