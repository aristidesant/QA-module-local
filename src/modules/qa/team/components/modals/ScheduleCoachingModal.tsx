import { Button, Group, Modal, Select, Stack, Textarea } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useTeamStore } from '~/stores/qa/teamStore';
import type { DimensionKey, TeamRole } from '../../types';
import { COACHING_TOPICS, DIMENSION_META, DIMENSION_ORDER } from '../../constants';

interface ScheduleCoachingModalProps {
	agentId: string;
	role: TeamRole;
	opened: boolean;
	onClose: () => void;
}

interface FormValues {
	date: string | null;
	topic: string | null;
	dimension: DimensionKey | null;
	notes: string;
}

const tomorrowAt10 = () => {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	d.setHours(10, 0, 0, 0);
	return d.toISOString();
};

export function ScheduleCoachingModal({ agentId, role, opened, onClose }: ScheduleCoachingModalProps) {
	const { t } = useTranslation('qa.team');
	const scheduleCoaching = useTeamStore((s) => s.scheduleCoaching);

	const form = useForm<FormValues>({
		initialValues: { date: tomorrowAt10(), topic: null, dimension: null, notes: '' },
	});

	const handleSubmit = (values: FormValues) => {
		if (!values.date || !values.topic) return;
		scheduleCoaching(
			{ agentId, date: new Date(values.date).toISOString(), topic: values.topic, linkedDimension: values.dimension ?? undefined, notes: values.notes || undefined },
			role,
		);
		notifications.show({ color: 'teal', message: t('modals.coaching.success') });
		form.reset();
		onClose();
	};

	return (
		<Modal opened={opened} onClose={onClose} title={t('modals.coaching.title')} centered>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='sm'>
					<DateTimePicker
						label={t('modals.coaching.date')}
						minDate={new Date()}
						value={form.values.date}
						onChange={(v) => form.setFieldValue('date', v)}
						valueFormat='MMM D, YYYY HH:mm'
					/>
					<Select
						label={t('modals.coaching.topic')}
						data={COACHING_TOPICS}
						searchable
						allowDeselect={false}
						value={form.values.topic}
						onChange={(v) => form.setFieldValue('topic', v)}
					/>
					<Select
						label={t('modals.coaching.dimension')}
						data={DIMENSION_ORDER.map((key) => ({ value: key, label: t(DIMENSION_META[key].labelKey) }))}
						value={form.values.dimension}
						onChange={(v) => form.setFieldValue('dimension', v as DimensionKey | null)}
						clearable
					/>
					<Textarea
						label={t('modals.coaching.notes')}
						value={form.values.notes}
						onChange={(e) => form.setFieldValue('notes', e.currentTarget.value)}
					/>
					<Group justify='flex-end' mt='sm'>
						<Button variant='default' onClick={onClose}>{t('modals.cancel')}</Button>
						<Button type='submit' disabled={!form.values.date || !form.values.topic}>{t('modals.coaching.submit')}</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
}
