import { Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Agent } from '~/models/qa';
import { getErrorMessage } from '~/utils/httpClient';
import { notifyError, notifySuccess } from '~/modules/qa/utils/notifications';
import classes from './CreateAgentUserModal.module.css';

interface CreateAgentUserModalProps {
	agent: Agent | null;
	isOpen: boolean;
	isLoading?: boolean;
	onClose: () => void;
	onConfirm: (agentId: number) => Promise<void>;
}

export default function CreateAgentUserModal({
	agent,
	isOpen,
	isLoading = false,
	onClose,
	onConfirm,
}: CreateAgentUserModalProps) {
	const { t } = useTranslation('qa.agents');
	const [error, setError] = useState<string | null>(null);
	const [email, setEmail] = useState<string>('');

	if (!agent) return null;

	const hasEmail = !!agent.email;
	const displayEmail = email || agent.email;

	const handleConfirm = async () => {
		try {
			setError(null);

			// If no existing email and user didn't enter one, show error
			if (!displayEmail) {
				setError(t('validation.email') || 'Email is required');
				return;
			}

			await onConfirm(agent.id);
			notifySuccess(t('notifications.invitationSent', { email: displayEmail }));
			setEmail('');
			onClose();
		} catch (err) {
			const message = getErrorMessage(err);
			setError(message);
			notifyError(message);
		}
	};

	const handleClose = () => {
		setError(null);
		setEmail('');
		onClose();
	};

	return (
		<Modal
			onClose={handleClose}
			opened={isOpen}
			size='sm'
			title={t('createUserModal.grantAccessTitle')}
		>
			<Stack gap='md'>
				<Stack gap='xs'>
					<div>
						<Text c='dimmed' size='xs' fw={500} tt='uppercase'>
							{t('createUserModal.agentName')}
						</Text>
						<Text size='sm'>
							{agent.firstName} {agent.lastName}
						</Text>
					</div>
				</Stack>

				{hasEmail ? (
					<>
						<div>
							<Text c='dimmed' size='xs' fw={500} tt='uppercase'>
								{t('createUserModal.agentEmail')}
							</Text>
							<Text size='sm'>{agent.email}</Text>
						</div>
						<Text size='sm' c='dimmed'>
							{t('createUserModal.grantAccessDescription', {
								email: agent.email,
							})}
						</Text>
					</>
				) : (
					<>
						<TextInput
							label={t('createUserModal.agentEmail')}
							placeholder={t('form.emailPlaceholder')}
							value={email}
							onChange={(e) => setEmail(e.currentTarget.value)}
							error={error && !displayEmail ? t('validation.email') : undefined}
							disabled={isLoading}
						/>
						<Text size='sm' c='dimmed'>
							{t('createUserModal.assignEmailDescription')}
						</Text>
					</>
				)}

				{error && (
					<Stack gap={6} p='xs' className={classes.errorStack}>
						<Group gap='xs' wrap='nowrap'>
							<IconAlertCircle size={16} className={classes.errorIcon} />
							<Text size='sm' c='red'>
								{error}
							</Text>
						</Group>
					</Stack>
				)}

				<Group justify='flex-end' gap='xs'>
					<Button onClick={handleClose} variant='light' disabled={isLoading}>
						{t('actions.cancel')}
					</Button>
					<Button onClick={handleConfirm} loading={isLoading}>
						{t('createUserModal.grantAccessButton')}
					</Button>
				</Group>
			</Stack>
		</Modal>
	);
}
