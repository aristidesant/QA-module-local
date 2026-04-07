import React from 'react';
import { Textarea } from '@mantine/core';
import { IconGitCommit } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import SectionCard from '~/components/SectionCard';
import { useCampaignFormContext } from '../../../campaignFormFunctions';

const CampaignVersionDescription: React.FC = () => {
	const { t } = useTranslation('campaign.form.agents');
	const form = useCampaignFormContext();

	return (
		<SectionCard
			icon={IconGitCommit}
			title={t('form.agent.versionDescription.title')}
			description={t('form.agent.versionDescription.description')}
		>
			<Textarea
				placeholder={t('form.agent.versionDescription.placeholder')}
				value={form.values.versionDescription ?? ''}
				onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
					form.setFieldValue('versionDescription', e.target.value)
				}
				autosize
				minRows={2}
				maxRows={5}
			/>
		</SectionCard>
	);
};

export default CampaignVersionDescription;
