import { Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import type { AgentBehavior } from '~/models/AgentBehavior';
import { useCloneAgentBehavior } from '~/queries/useAgentBehaviors';

interface CloneBehaviorModalProps {
	opened: boolean;
	onClose: () => void;
	sourceBehavior: AgentBehavior | null;
}

const CloneBehaviorModal: React.FC<CloneBehaviorModalProps> = ({
	opened,
	onClose,
	sourceBehavior,
}) => {
	const { t } = useTranslation('campaign-predefined-params');
	const cloneMutation = useCloneAgentBehavior();
	const form = useForm({
		initialValues: {
			name: '',
		},
	});

	const handleClose = () => {
		form.reset();
		onClose();
	};

	const handleSubmit = async (values: typeof form.values) => {
		if (!sourceBehavior) return;

		try {
			await cloneMutation.mutateAsync({
				id: sourceBehavior.id,
				data: values.name.trim() ? { name: values.name.trim() } : {},
			});
			notifications.show({
				title: t('status.success', { ns: 'common' }),
				message: t('clone.notifications.success'),
				color: 'green',
			});
			handleClose();
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 409) {
				form.setFieldError('name', t('clone.validation.nameConflict'));
				return;
			}

			notifications.show({
				title: t('status.error', { ns: 'common' }),
				message: t('clone.notifications.error'),
				color: 'red',
			});
		}
	};

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title={t('clone.title')}
			centered
			size='md'
		>
			<form onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='sm'>
					<Text size='sm' c='dimmed'>
						{t('clone.description', {
							name: sourceBehavior?.name ?? '',
						})}
					</Text>
					<TextInput
						label={t('clone.name.label')}
						description={t('clone.name.description')}
						placeholder={t('clone.name.placeholder', {
							name: sourceBehavior?.name ?? '',
						})}
						{...form.getInputProps('name')}
					/>
					<Group justify='flex-end' gap='xs' mt='xs'>
						<Button variant='default' size='sm' onClick={handleClose}>
							{t('actions.cancel', { ns: 'common' })}
						</Button>
						<Button type='submit' size='sm' loading={cloneMutation.isPending}>
							{t('clone.actions.submit')}
						</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
};

export default CloneBehaviorModal;
