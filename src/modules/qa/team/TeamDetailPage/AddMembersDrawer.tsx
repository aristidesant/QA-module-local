import { useEffect, useState } from 'react';
import { Button, Group, MultiSelect, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { AppDrawer } from '~/components/AppDrawer';
import { useTeamStore } from '~/stores/qa/teamStore';
import { notifySuccess, notifyWarning } from '~/modules/qa/utils/notifications';

interface AddMembersDrawerProps {
	opened: boolean;
	onClose: () => void;
	supervisorId: string;
	teamName: string;
}

export function AddMembersDrawer({
	opened,
	onClose,
	supervisorId,
	teamName,
}: AddMembersDrawerProps) {
	const { t } = useTranslation('qa.team');
	const profiles = useTeamStore((s) => s.profiles);
	const addMembers = useTeamStore((s) => s.addMembers);
	const [selected, setSelected] = useState<string[]>([]);

	useEffect(() => {
		if (opened) setSelected([]);
	}, [opened]);

	const options = Object.values(profiles)
		.map((p) => p.agent)
		.filter((a) => a.supervisorId !== supervisorId)
		.map((a) => ({ value: a.id, label: `${a.name} · ${a.team}` }));

	const handleSubmit = () => {
		if (selected.length === 0) {
			notifyWarning(t('teams.addMembers.validationEmpty'));
			return;
		}
		addMembers(selected, supervisorId);
		notifySuccess(
			t('teams.addMembers.success', { count: selected.length, team: teamName })
		);
		setSelected([]);
		onClose();
	};

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			title={t('teams.addMembers.title')}
			size='md'
		>
			<Stack gap='md'>
				<MultiSelect
					label={t('teams.addMembers.source')}
					description={t('teams.addMembers.sourceHint')}
					data={options}
					value={selected}
					onChange={setSelected}
					searchable
					clearable
				/>
				<Group justify='flex-end'>
					<Button variant='default' onClick={onClose}>
						{t('modals.cancel')}
					</Button>
					<Button onClick={handleSubmit}>{t('teams.addMembers.submit')}</Button>
				</Group>
			</Stack>
		</AppDrawer>
	);
}
