import { Button, Group, Modal, Stack, Text, Textarea } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { LmsAssignment } from '~/models/qa';
import { day } from '../mockData';

interface RescheduleModalProps {
	assignment: LmsAssignment | null;
	opened: boolean;
	onClose: () => void;
	onSubmit: (proposedDueDate: string, reason: string) => void;
}

interface FormValues {
	date: string | null;
	reason: string;
}

export function RescheduleModal({ assignment, opened, onClose, onSubmit }: RescheduleModalProps) {
	const { t } = useTranslation('qa.lms');

	const form = useForm<FormValues>({
		initialValues: { date: null, reason: '' },
	});

	useEffect(() => {
		if (opened && assignment) {
			form.setValues({ date: day(assignment.dueDate, 7), reason: '' });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [opened, assignment?.id]);

	if (!assignment) return null;

	const valid = !!form.values.date && form.values.reason.trim().length >= 10;

	const handleSubmit = () => {
		if (!form.values.date) return;
		onSubmit(new Date(form.values.date).toISOString().slice(0, 10), form.values.reason.trim());
		form.reset();
		onClose();
	};

	return (
		<Modal opened={opened} onClose={onClose} title={t('agent.reschedule.title')} centered>
			<Stack gap='sm'>
				<Text size='sm' c='dimmed'>
					{t('agent.reschedule.current', { date: assignment.dueDate })}
				</Text>
				<DatePickerInput
					label={t('agent.reschedule.newDate')}
					minDate={new Date(assignment.dueDate)}
					value={form.values.date}
					onChange={(v) => form.setFieldValue('date', v)}
				/>
				<Textarea
					label={t('agent.reschedule.reason')}
					placeholder={t('agent.reschedule.reasonPlaceholder')}
					minRows={3}
					autosize
					value={form.values.reason}
					onChange={(e) => form.setFieldValue('reason', e.currentTarget.value)}
				/>
				<Group justify='flex-end' mt='sm'>
					<Button variant='default' onClick={onClose}>
						{t('agent.reschedule.cancel')}
					</Button>
					<Button onClick={handleSubmit} disabled={!valid}>
						{t('agent.reschedule.submit')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
