import { Text, Textarea, ThemeIcon } from '@mantine/core';
import { IconBulb, IconTargetArrow } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import { useCampaignFormContext } from '../../campaignFormFunctions';
import styles from './GeneralSection.module.css';

const EffectiveContactObjectiveSection = () => {
	const { t } = useTranslation('campaign.form.general');
	const form = useCampaignFormContext();

	return (
		<SectionCard
			title={t('general.effectiveContactObjective.title')}
			description={t('general.effectiveContactObjective.description')}
			icon={IconTargetArrow}
			headerAccent='green'
			contentSpacing='sm'
		>
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
				description={t('general.effectiveContactObjective.fieldDescription')}
				placeholder={t('general.effectiveContactObjective.placeholder')}
				autosize
				minRows={5}
				maxRows={10}
				size='sm'
				{...form.getInputProps('effectiveContactObjective')}
			/>
		</SectionCard>
	);
};

export default EffectiveContactObjectiveSection;
