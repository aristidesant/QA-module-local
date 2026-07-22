import { Button, Group, Select, Stack, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type {
	AgentType,
	CreateAgentPayload,
	UpdateAgentPayload,
} from '~/models/qa';
import { isApiError } from '~/utils/httpClient';
import { notifyError } from '~/modules/qa/utils/notifications';
import type { AgentEditorFormProps } from './AgentEditorForm.types';

interface AgentEditorValues {
	employeeId: string;
	agentType: AgentType;
	firstName: string;
	lastName: string;
	email: string;
	team: string;
}

function optionalValue(value: string) {
	return value.trim() || undefined;
}

export default function AgentEditorForm({
	agent,
	loading,
	onCancel,
	onSubmit,
}: AgentEditorFormProps) {
	const { t } = useTranslation('qa.agents');
	const form = useForm<AgentEditorValues>({
		initialValues: {
			employeeId: '',
			agentType: 'HUMAN',
			firstName: '',
			lastName: '',
			email: '',
			team: '',
		},
		validate: {
			employeeId: (value) => {
				if (!value.trim()) return t('validation.employeeIdRequired');
				return value.trim().length > 100
					? t('validation.maxLength', { count: 100 })
					: null;
			},
			firstName: (value) =>
				value.trim().length > 100
					? t('validation.maxLength', { count: 100 })
					: null,
			lastName: (value) =>
				value.trim().length > 100
					? t('validation.maxLength', { count: 100 })
					: null,
			email: (value) => {
				if (!value.trim()) return null;
				if (value.trim().length > 150) {
					return t('validation.maxLength', { count: 150 });
				}
				return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
					value.trim()
				)
					? null
					: t('validation.email');
			},
			team: (value) =>
				value.trim().length > 150
					? t('validation.maxLength', { count: 150 })
					: null,
		},
	});

	const { clearErrors, resetDirty, setValues } = form;

	useEffect(() => {
		setValues({
			employeeId: agent?.employeeId ?? '',
			agentType: agent?.agentType ?? 'HUMAN',
			firstName: agent?.firstName ?? '',
			lastName: agent?.lastName ?? '',
			email: agent?.email ?? '',
			team: agent?.team ?? '',
		});
		resetDirty();
		clearErrors();
	}, [agent, clearErrors, resetDirty, setValues]);

	const submit = form.onSubmit(async (values) => {
		const mutableFields: UpdateAgentPayload = {
			agentType: values.agentType,
			firstName: optionalValue(values.firstName) ?? (agent ? null : undefined),
			lastName: optionalValue(values.lastName) ?? (agent ? null : undefined),
			email: optionalValue(values.email) ?? (agent ? null : undefined),
			team: optionalValue(values.team) ?? (agent ? null : undefined),
		};
		const payload: CreateAgentPayload | UpdateAgentPayload = agent
			? mutableFields
			: {
					employeeId: values.employeeId.trim(),
					agentType: mutableFields.agentType,
					firstName: mutableFields.firstName ?? undefined,
					lastName: mutableFields.lastName ?? undefined,
					email: mutableFields.email ?? undefined,
					team: mutableFields.team ?? undefined,
				};

		try {
			await onSubmit(payload);
		} catch (error) {
			const validationMessages = isApiError(error)
				? error.response.data.message
				: undefined;
			const messages = Array.isArray(validationMessages)
				? validationMessages
				: validationMessages
					? [validationMessages]
					: [];

			for (const field of [
				'employeeId',
				'agentType',
				'firstName',
				'lastName',
				'email',
				'team',
			] as const) {
				const fieldMessage = messages.find((item) =>
					item.toLowerCase().includes(field.toLowerCase())
				);
				if (fieldMessage) form.setFieldError(field, fieldMessage);
			}

			if (isApiError(error) && error.response.data.statusCode === 409) {
				form.setFieldError('employeeId', t('validation.duplicate'));
				form.setFieldError('email', t('validation.duplicate'));
			}

			notifyError(error);
		}
	});

	return (
		// noValidate: let Mantine render the localized validation messages instead
		// of the browser's native bubbles (which ignore the app locale and theme).
		<form noValidate onSubmit={submit}>
			<Stack gap='sm'>
				<TextInput
					disabled={Boolean(agent)}
					label={t('form.employeeId')}
					maxLength={100}
					placeholder={t('form.employeeIdPlaceholder')}
					required
					size='sm'
					{...form.getInputProps('employeeId')}
				/>
				<Select
					allowDeselect={false}
					data={[
						{ label: t('types.human'), value: 'HUMAN' },
						{ label: t('types.aiBot'), value: 'AI_BOT' },
					]}
					label={t('form.agentType')}
					size='sm'
					{...form.getInputProps('agentType')}
				/>
				<Group grow>
					<TextInput
						label={t('form.firstName')}
						maxLength={100}
						size='sm'
						{...form.getInputProps('firstName')}
					/>
					<TextInput
						label={t('form.lastName')}
						maxLength={100}
						size='sm'
						{...form.getInputProps('lastName')}
					/>
				</Group>
				<TextInput
					label={t('form.email')}
					maxLength={150}
					placeholder={t('form.emailPlaceholder')}
					size='sm'
					type='email'
					{...form.getInputProps('email')}
				/>
				<TextInput
					label={t('form.team')}
					maxLength={150}
					placeholder={t('form.teamPlaceholder')}
					size='sm'
					{...form.getInputProps('team')}
				/>
				<Group justify='flex-end'>
					<Button onClick={onCancel} size='sm' variant='subtle'>
						{t('actions.cancel')}
					</Button>
					<Button
						leftSection={<IconDeviceFloppy size={16} />}
						loading={loading}
						size='sm'
						type='submit'
					>
						{agent ? t('actions.save') : t('actions.create')}
					</Button>
				</Group>
			</Stack>
		</form>
	);
}
