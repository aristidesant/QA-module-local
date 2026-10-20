import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { selectSupervisors, useTeamStore } from '~/stores/qa/teamStore';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import type { RosterSupervisor } from '../../types';

interface EditTeamModalProps {
	/** The team being edited; the modal is closed while this is null. */
	supervisor: RosterSupervisor | null;
	onClose: () => void;
}

interface EditTeamValues {
	teamName: string;
}

/** Renames a team; the new name relabels every member. */
export const EditTeamModal: React.FC<EditTeamModalProps> = ({
	supervisor,
	onClose,
}) => {
	const { t } = useTranslation('qa.team');
	const supervisors = useTeamStore(selectSupervisors);
	const updateTeam = useTeamStore((s) => s.updateTeam);

	const form = useForm<EditTeamValues>({
		initialValues: { teamName: '' },
		validate: {
			teamName: (value) => {
				if (!value.trim()) return t('teamConfig.drawer.validation.teamName');
				const taken = Object.values(supervisors).some(
					(s) =>
						s.id !== supervisor?.id &&
						s.team.toLowerCase() === value.trim().toLowerCase()
				);
				return taken ? t('teamConfig.drawer.validation.teamNameTaken') : null;
			},
		},
	});

	useEffect(() => {
		if (supervisor) {
			const values = {
				teamName: supervisor.team,
			};
			form.setValues(values);
			form.resetDirty(values);
			form.clearErrors();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [supervisor?.id]);

	const handleSubmit = (values: EditTeamValues) => {
		if (!supervisor) return;
		const teamName = values.teamName.trim();
		updateTeam(supervisor.id, { team: teamName });
		notifySuccess(t('teamConfig.toast.updated', { team: teamName }));
		onClose();
	};

	return (
		<Modal
			opened={supervisor !== null}
			onClose={onClose}
			title={t('teamConfig.editTeam.title')}
			centered
			size='sm'
		>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='md'>
					<TextInput
						label={t('teamConfig.editTeam.name')}
						data-autofocus
						{...form.getInputProps('teamName')}
					/>
					<Group justify='flex-end'>
						<Button variant='default' onClick={onClose}>
							{t('modals.cancel')}
						</Button>
						<Button type='submit'>{t('teamConfig.editTeam.save')}</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
};

export default EditTeamModal;
