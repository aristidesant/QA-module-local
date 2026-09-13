import { Button, Group, Modal, SegmentedControl, Stack, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useTeamStore } from '~/stores/qa/teamStore';
import type { TeamRole } from '../../types';
import type { AgentNotification } from '~/models/qa/notifications';

interface SendMessageModalProps {
	agentId: string;
	role: TeamRole;
	opened: boolean;
	onClose: () => void;
}

interface FormValues {
	title: string;
	message: string;
	priority: AgentNotification['priority'];
}

export function SendMessageModal({ agentId, role, opened, onClose }: SendMessageModalProps) {
	const { t } = useTranslation('qa.team');
	const sendMessage = useTeamStore((s) => s.sendMessage);

	const form = useForm<FormValues>({
		initialValues: { title: '', message: '', priority: 'NORMAL' },
		validate: {
			title: (v) => (v.trim() ? null : true),
			message: (v) => (v.trim() ? null : true),
		},
	});

	const handleSubmit = (values: FormValues) => {
		sendMessage({ agentId, title: values.title, message: values.message, priority: values.priority }, role);
		notifications.show({ color: 'teal', message: t('modals.message.success') });
		form.reset();
		onClose();
	};

	return (
		<Modal opened={opened} onClose={onClose} title={t('modals.message.title')} centered>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='sm'>
					<TextInput label={t('modals.message.subject')} {...form.getInputProps('title')} />
					<Textarea label={t('modals.message.body')} minRows={4} {...form.getInputProps('message')} />
					<SegmentedControl
						data={['LOW', 'NORMAL', 'HIGH']}
						value={form.values.priority}
						onChange={(v) => form.setFieldValue('priority', v as AgentNotification['priority'])}
					/>
					<Group justify='flex-end' mt='sm'>
						<Button variant='default' onClick={onClose}>{t('modals.cancel')}</Button>
						<Button type='submit'>{t('modals.message.submit')}</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
}
