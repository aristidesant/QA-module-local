import { useEffect, useState } from 'react';
import { Button, Group, MultiSelect, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { AppDrawer } from '~/components/AppDrawer';
import { useTeamStore } from '~/stores/qa/teamStore';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { TEAM_CAMPAIGNS } from '../mockData';

interface AssignCampaignsDrawerProps {
	opened: boolean;
	onClose: () => void;
	supervisorId: string;
	teamName: string;
	currentCampaignIds: string[];
}

export function AssignCampaignsDrawer({
	opened,
	onClose,
	supervisorId,
	teamName,
	currentCampaignIds,
}: AssignCampaignsDrawerProps) {
	const { t } = useTranslation('qa.team');
	const setTeamCampaigns = useTeamStore((s) => s.setTeamCampaigns);
	const [selected, setSelected] = useState<string[]>(currentCampaignIds);

	useEffect(() => {
		if (opened) setSelected(currentCampaignIds);
	}, [opened, currentCampaignIds]);

	const handleSubmit = () => {
		setTeamCampaigns(supervisorId, selected);
		notifySuccess(t('teams.assignCampaigns.success', { team: teamName }));
		onClose();
	};

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			title={t('teams.assignCampaigns.title')}
			size='md'
		>
			<Stack gap='md'>
				<MultiSelect
					label={t('teams.assignCampaigns.campaigns')}
					data={TEAM_CAMPAIGNS.map((c) => ({
						value: c.id,
						label: `${c.name} (${c.campaignType})`,
					}))}
					value={selected}
					onChange={setSelected}
					searchable
					clearable
				/>
				<Group justify='flex-end'>
					<Button variant='default' onClick={onClose}>
						{t('modals.cancel')}
					</Button>
					<Button onClick={handleSubmit}>
						{t('teams.assignCampaigns.submit')}
					</Button>
				</Group>
			</Stack>
		</AppDrawer>
	);
}
