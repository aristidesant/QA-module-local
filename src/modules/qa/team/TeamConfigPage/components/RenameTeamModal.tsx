import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { selectSupervisors, useTeamStore } from '~/stores/qa/teamStore';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import type { RosterSupervisor } from '../../types';

interface RenameTeamModalProps {
	/** The team being renamed; the modal is closed while this is null. */
	supervisor: RosterSupervisor | null;
	onClose: () => void;
}

/** Renames a team; the new name relabels every member. */
export const RenameTeamModal: React.FC<RenameTeamModalProps> = ({
	supervisor,
	onClose,
}) => {
	const { t } = useTranslation('qa.team');
	const supervisors = useTeamStore(selectSupervisors);
	const renameTeam = useTeamStore((s) => s.renameTeam);

	const form = useForm({
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
			form.setValues({ teamName: supervisor.team });
			form.resetDirty({ teamName: supervisor.team });
			form.clearErrors();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [supervisor?.id]);

	const handleSubmit = (values: { teamName: string }) => {
		if (!supervisor) return;
		const teamName = values.teamName.trim();
		renameTeam(supervisor.id, teamName);
		notifySuccess(t('teamConfig.toast.renamed', { team: teamName }));
		onClose();
	};

	return (
		<Modal
			opened={supervisor !== null}
			onClose={onClose}
			title={t('teamConfig.rename.title')}
			centered
			size='sm'
		>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='md'>
					<TextInput
						label={t('teamConfig.rename.label')}
						data-autofocus
						{...form.getInputProps('teamName')}
					/>
					<Group justify='flex-end'>
						<Button variant='default' onClick={onClose}>
							{t('modals.cancel')}
						</Button>
						<Button type='submit'>{t('teamConfig.rename.save')}</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
};

export default RenameTeamModal;
