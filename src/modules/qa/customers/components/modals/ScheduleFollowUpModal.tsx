import { Button, Group, Modal, Select, Stack, Textarea } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useCustomersStore } from '~/stores/qa/customersStore';
import { TEAM_AGENTS } from '~/modules/qa/team/mockData';
import { SUPERVISOR_PERSONA } from '~/modules/qa/team/constants';
import type { TeamRole } from '~/modules/qa/team/types';
import { FOLLOW_UP_REASONS } from '../../constants';

interface ScheduleFollowUpModalProps {
	customerId: string;
	role: TeamRole;
	defaultAgentId?: string;
	opened: boolean;
	onClose: () => void;
}

interface FormValues {
	date: string | null;
	reason: string | null;
	agentId: string | null;
	note: string;
}

const tomorrowAt10 = () => {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	d.setHours(10, 0, 0, 0);
	return d.toISOString();
};

export function ScheduleFollowUpModal({ customerId, role, defaultAgentId, opened, onClose }: ScheduleFollowUpModalProps) {
	const { t } = useTranslation('qa.customers');
	const scheduleFollowUp = useCustomersStore((s) => s.scheduleFollowUp);
	const visibleAgents = role === 'qa-manager' ? TEAM_AGENTS : TEAM_AGENTS.filter((a) => a.supervisorId === SUPERVISOR_PERSONA.id);

	const form = useForm<FormValues>({
		initialValues: { date: tomorrowAt10(), reason: null, agentId: defaultAgentId ?? visibleAgents[0]?.id ?? null, note: '' },
	});

	const handleSubmit = (values: FormValues) => {
		const agent = visibleAgents.find((a) => a.id === values.agentId) ?? TEAM_AGENTS.find((a) => a.id === values.agentId);
		if (!values.date || !values.reason || !agent) return;
		scheduleFollowUp(
			{ customerId, date: new Date(values.date).toISOString(), reason: values.reason, agentId: agent.id, agentName: agent.name, note: values.note || undefined },
			role,
		);
		notifications.show({ color: 'teal', message: t('modals.followUp.success') });
		form.reset();
		onClose();
	};

	return (
		<Modal opened={opened} onClose={onClose} title={t('modals.followUp.title')} centered>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='sm'>
					<DateTimePicker
						label={t('modals.followUp.date')}
						minDate={new Date()}
						value={form.values.date}
						onChange={(v) => form.setFieldValue('date', v)}
						valueFormat='MMM D, YYYY HH:mm'
					/>
					<Select
						label={t('modals.followUp.reason')}
						data={FOLLOW_UP_REASONS}
						value={form.values.reason}
						onChange={(v) => form.setFieldValue('reason', v)}
						allowDeselect={false}
					/>
					<Select
						label={t('modals.followUp.agent')}
						data={visibleAgents.map((a) => ({ value: a.id, label: `${a.name} · ${a.team}` }))}
						value={form.values.agentId}
						onChange={(v) => form.setFieldValue('agentId', v)}
						allowDeselect={false}
						searchable
					/>
					<Textarea
						label={t('modals.followUp.note')}
						value={form.values.note}
						onChange={(e) => form.setFieldValue('note', e.currentTarget.value)}
					/>
					<Group justify='flex-end' mt='sm'>
						<Button variant='default' onClick={onClose}>{t('modals.cancel')}</Button>
						<Button type='submit' disabled={!form.values.date || !form.values.reason || !form.values.agentId}>{t('modals.followUp.submit')}</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
}
