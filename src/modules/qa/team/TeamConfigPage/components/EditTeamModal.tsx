import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Button,
	Group,
	Modal,
	NumberInput,
	Stack,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { selectSupervisors, useTeamStore } from '~/stores/qa/teamStore';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import { DEFAULT_TEAM_TARGET_SIZE } from '../../constants';
import type { RosterSupervisor } from '../../types';

interface EditTeamModalProps {
	/** The team being edited; the modal is closed while this is null. */
	supervisor: RosterSupervisor | null;
	onClose: () => void;
}

interface EditTeamValues {
	teamName: string;
	targetSize: number;
}

/** Edits a team's name (relabels every member) and its target size. */
export const EditTeamModal: React.FC<EditTeamModalProps> = ({
	supervisor,
	onClose,
}) => {
	const { t } = useTranslation('qa.team');
	const supervisors = useTeamStore(selectSupervisors);
	const updateTeam = useTeamStore((s) => s.updateTeam);

	const form = useForm<EditTeamValues>({
		initialValues: { teamName: '', targetSize: DEFAULT_TEAM_TARGET_SIZE },
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
			targetSize: (value) =>
				Number.isInteger(value) && value >= 1
					? null
					: t('teamConfig.drawer.validation.targetSize'),
		},
	});

	useEffect(() => {
		if (supervisor) {
			const values = {
				teamName: supervisor.team,
				targetSize: supervisor.targetSize ?? DEFAULT_TEAM_TARGET_SIZE,
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
		updateTeam(supervisor.id, {
			team: teamName,
			targetSize: values.targetSize,
		});
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
					<NumberInput
						label={t('teamConfig.editTeam.targetSize')}
						description={t('teamConfig.drawer.targetSizeHint')}
						min={1}
						max={200}
						allowDecimal={false}
						{...form.getInputProps('targetSize')}
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
