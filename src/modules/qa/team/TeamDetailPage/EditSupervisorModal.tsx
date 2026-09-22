import { useEffect, useState } from 'react';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useTeamStore } from '~/stores/qa/teamStore';
import { notifySuccess, notifyWarning } from '~/modules/qa/utils/notifications';
import type { RosterSupervisor } from '../types';

interface EditSupervisorModalProps {
	opened: boolean;
	onClose: () => void;
	supervisor: RosterSupervisor;
}

export function EditSupervisorModal({
	opened,
	onClose,
	supervisor,
}: EditSupervisorModalProps) {
	const { t } = useTranslation('qa.team');
	const updateSupervisor = useTeamStore((s) => s.updateSupervisor);
	const [name, setName] = useState(supervisor.name);
	const [email, setEmail] = useState(supervisor.email);

	useEffect(() => {
		if (opened) {
			setName(supervisor.name);
			setEmail(supervisor.email);
		}
	}, [opened, supervisor]);

	const handleSubmit = () => {
		if (!name.trim()) {
			notifyWarning(t('teams.editSupervisor.validationName'));
			return;
		}
		updateSupervisor(supervisor.id, { name: name.trim(), email: email.trim() });
		notifySuccess(t('teams.editSupervisor.success'));
		onClose();
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('teams.editSupervisor.title')}
			centered
		>
			<Stack gap='sm'>
				<TextInput
					label={t('teams.editSupervisor.name')}
					value={name}
					onChange={(e) => setName(e.currentTarget.value)}
				/>
				<TextInput
					label={t('teams.editSupervisor.email')}
					value={email}
					onChange={(e) => setEmail(e.currentTarget.value)}
				/>
				<Group justify='flex-end' mt='sm'>
					<Button variant='default' onClick={onClose}>
						{t('modals.cancel')}
					</Button>
					<Button onClick={handleSubmit}>
						{t('teams.editSupervisor.submit')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
