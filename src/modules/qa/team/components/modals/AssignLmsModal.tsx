import { Button, Group, Modal, Select, Stack, Switch } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useTeamStore } from '~/stores/qa/teamStore';
import type { LmsMaterialType, TeamRole } from '../../types';
import { LMS_CATALOG } from '../../constants';

interface AssignLmsModalProps {
	agentId: string;
	role: TeamRole;
	opened: boolean;
	onClose: () => void;
}

interface FormValues {
	materialId: string | null;
	dueDate: string | null;
	mandatory: boolean;
}

const inDays = (days: number) => {
	const d = new Date();
	d.setDate(d.getDate() + days);
	return d.toISOString();
};

export function AssignLmsModal({ agentId, role, opened, onClose }: AssignLmsModalProps) {
	const { t } = useTranslation('qa.team');
	const assignLms = useTeamStore((s) => s.assignLms);

	const form = useForm<FormValues>({
		initialValues: { materialId: null, dueDate: inDays(14), mandatory: false },
	});

	const handleSubmit = (values: FormValues) => {
		const material = LMS_CATALOG.find((m) => m.id === values.materialId);
		if (!material || !values.dueDate) return;
		assignLms(
			{ agentId, materialId: material.id, title: material.title, type: material.type as LmsMaterialType, dueDate: new Date(values.dueDate).toISOString().slice(0, 10), mandatory: values.mandatory },
			role,
		);
		notifications.show({ color: 'teal', message: t('modals.lms.success') });
		form.reset();
		onClose();
	};

	return (
		<Modal opened={opened} onClose={onClose} title={t('modals.lms.title')} centered>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='sm'>
					<Select
						label={t('modals.lms.material')}
						data={LMS_CATALOG.map((m) => ({ value: m.id, label: `${m.title} · ${m.type} · ${m.durationMin} min` }))}
						value={form.values.materialId}
						onChange={(v) => form.setFieldValue('materialId', v)}
						searchable
					/>
					<DatePickerInput
						label={t('modals.lms.due')}
						minDate={new Date()}
						value={form.values.dueDate}
						onChange={(v) => form.setFieldValue('dueDate', v)}
					/>
					<Switch
						label={t('modals.lms.mandatory')}
						checked={form.values.mandatory}
						onChange={(e) => form.setFieldValue('mandatory', e.currentTarget.checked)}
					/>
					<Group justify='flex-end' mt='sm'>
						<Button variant='default' onClick={onClose}>{t('modals.cancel')}</Button>
						<Button type='submit' disabled={!form.values.materialId || !form.values.dueDate}>{t('modals.lms.submit')}</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
}
