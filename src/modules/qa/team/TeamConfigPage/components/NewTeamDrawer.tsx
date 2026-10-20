import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, MultiSelect, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { IconUsersGroup } from '@tabler/icons-react';
import { AppDrawer } from '~/components/AppDrawer';
import SectionCard from '~/components/SectionCard';
import {
	selectProfiles,
	selectSupervisors,
	useTeamStore,
} from '~/stores/qa/teamStore';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import type { RosterSupervisor } from '../../types';

interface NewTeamValues {
	teamName: string;
	supervisorName: string;
	supervisorEmail: string;
	memberIds: string[];
}

const EMPTY: NewTeamValues = {
	teamName: '',
	supervisorName: '',
	supervisorEmail: '',
	memberIds: [],
};

interface NewTeamDrawerProps {
	opened: boolean;
	onClose: () => void;
	/** Called with the new team right after it is created. */
	onCreated?: (supervisor: RosterSupervisor) => void;
}

/** Creates a team together with its supervisor and, optionally, the agents who start in it. */
export const NewTeamDrawer: React.FC<NewTeamDrawerProps> = ({
	opened,
	onClose,
	onCreated,
}) => {
	const { t } = useTranslation('qa.team');
	const supervisors = useTeamStore(selectSupervisors);
	const profiles = useTeamStore(selectProfiles);
	const createTeam = useTeamStore((s) => s.createTeam);

	const nameTaken = (name: string) =>
		Object.values(supervisors).some(
			(s) => s.team.toLowerCase() === name.trim().toLowerCase()
		);

	const form = useForm<NewTeamValues>({
		initialValues: EMPTY,
		validate: {
			teamName: (value) =>
				!value.trim()
					? t('teamConfig.drawer.validation.teamName')
					: nameTaken(value)
						? t('teamConfig.drawer.validation.teamNameTaken')
						: null,
			supervisorName: (value) =>
				value.trim() ? null : t('teamConfig.drawer.validation.supervisorName'),
			supervisorEmail: (value) =>
				/^\S+@\S+\.\S+$/.test(value.trim())
					? null
					: t('teamConfig.drawer.validation.email'),
		},
	});

	// A fresh form every time the drawer opens.
	useEffect(() => {
		if (opened) {
			form.setValues(EMPTY);
			form.resetDirty(EMPTY);
			form.clearErrors();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [opened]);

	const agentOptions = Object.values(profiles)
		.map((p) => p.agent)
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((a) => ({ value: a.id, label: `${a.name} · ${a.team}` }));

	const requestClose = () => {
		if (!form.isDirty()) {
			onClose();
			return;
		}
		modals.openConfirmModal({
			title: t('teamConfig.discard.title'),
			children: t('teamConfig.discard.body'),
			labels: {
				confirm: t('teamConfig.discard.confirm'),
				cancel: t('modals.cancel'),
			},
			confirmProps: { color: 'red' },
			onConfirm: onClose,
		});
	};

	const handleSubmit = (values: NewTeamValues) => {
		const supervisor = createTeam({
			teamName: values.teamName,
			supervisorName: values.supervisorName,
			supervisorEmail: values.supervisorEmail,
			memberIds: values.memberIds,
		});
		notifySuccess(t('teamConfig.toast.created', { team: supervisor.team }));
		onCreated?.(supervisor);
		onClose();
	};

	return (
		<AppDrawer
			opened={opened}
			onClose={requestClose}
			title={t('teamConfig.drawer.title')}
			description={t('teamConfig.drawer.description')}
			icon={<IconUsersGroup size={20} />}
			size='md'
		>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='md'>
					<SectionCard padding='md' title={t('teamConfig.drawer.teamSection')}>
						<Stack gap='sm'>
							<TextInput
								label={t('teamConfig.drawer.teamName')}
								data-autofocus
								withAsterisk
								{...form.getInputProps('teamName')}
							/>
						</Stack>
					</SectionCard>

					<SectionCard
						padding='md'
						title={t('teamConfig.drawer.supervisorSection')}
					>
						<Stack gap='sm'>
							<TextInput
								label={t('teamConfig.drawer.supervisorName')}
								withAsterisk
								{...form.getInputProps('supervisorName')}
							/>
							<TextInput
								label={t('teamConfig.drawer.supervisorEmail')}
								type='email'
								withAsterisk
								{...form.getInputProps('supervisorEmail')}
							/>
						</Stack>
					</SectionCard>

					<MultiSelect
						label={t('teamConfig.drawer.members')}
						description={t('teamConfig.drawer.membersHint')}
						data={agentOptions}
						searchable
						clearable
						{...form.getInputProps('memberIds')}
					/>

					<Group justify='flex-end'>
						<Button variant='default' onClick={requestClose}>
							{t('modals.cancel')}
						</Button>
						<Button type='submit'>{t('teamConfig.drawer.create')}</Button>
					</Group>
				</Stack>
			</form>
		</AppDrawer>
	);
};

export default NewTeamDrawer;
