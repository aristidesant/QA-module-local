import React from 'react';
import { MultiSelect, Text, Loader } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useGetSimpleCampaigns } from '~/queries/campaignsQueries';
import classes from '../RoleForm.module.css';

interface RoleCampaignsSectionProps {
	campaignIds: string[];
	onChange: (campaignIds: string[]) => void;
	disabled?: boolean;
}

const RoleCampaignsSection: React.FC<RoleCampaignsSectionProps> = ({
	campaignIds,
	onChange,
	disabled,
}) => {
	const { t } = useTranslation('roles');
	const { data: campaigns, isLoading } = useGetSimpleCampaigns();

	const options =
		campaigns?.map((c) => ({
			value: String(c.id),
			label: c.name,
		})) || [];

	return (
		<section className={classes.sectionCard}>
			<div className={classes.sectionHeader}>
				<Text className={classes.sectionTitle}>
					{t('form.sections.campaigns.title', { defaultValue: 'Campaigns' })}
				</Text>
				<Text className={classes.sectionDescription}>
					{t('form.sections.campaigns.description', {
						defaultValue: 'Assign authorized campaigns for this role.',
					})}
				</Text>
			</div>

			<MultiSelect
				data={options}
				value={campaignIds}
				onChange={onChange}
				placeholder={t('form.fields.campaigns.placeholder', {
					defaultValue: 'Select campaigns',
				})}
				searchable
				clearable
				disabled={disabled || isLoading}
				rightSection={isLoading ? <Loader size={16} /> : null}
				size='sm'
				className={classes.field}
			/>
		</section>
	);
};

export default RoleCampaignsSection;
