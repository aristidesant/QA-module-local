import {
	Button,
	Divider,
	Group,
	NumberInput,
	Select,
	Stack,
	Switch,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type {
	CreateEvaluatorAgentPayload,
	EvaluatorAgentParams,
	LlmProvider,
} from '~/models/qa';
import { isApiError } from '~/utils/httpClient';
import { notifyError } from '~/modules/qa/utils/notifications';
import type { EvaluatorAgentEditorFormProps } from './EvaluatorAgentEditorForm.types';

interface EvaluatorAgentEditorValues {
	name: string;
	systemPrompt: string;
	provider: LlmProvider;
	model: string;
	isActive: boolean;
	temperature: number | '';
	maxTokens: number | '';
	timeoutMs: number | '';
	metadata: string;
}

const PROVIDER_OPTIONS: LlmProvider[] = ['OPENAI', 'GEMINI', 'BEDROCK'];

function numberFromParams(
	params: Record<string, unknown> | null | undefined,
	key: string
): number | '' {
	const value = params?.[key];

	return typeof value === 'number' && Number.isFinite(value) ? value : '';
}

export default function EvaluatorAgentEditorForm({
	evaluatorAgent,
	loading,
	onCancel,
	onSubmit,
}: EvaluatorAgentEditorFormProps) {
	const { t } = useTranslation('qa.evaluatorAgents');
	const form = useForm<EvaluatorAgentEditorValues>({
		initialValues: {
			name: '',
			systemPrompt: '',
			provider: 'OPENAI',
			model: '',
			isActive: true,
			temperature: '',
			maxTokens: '',
			timeoutMs: '',
			metadata: '',
		},
		validate: {
			name: (value) => {
				if (!value.trim()) return t('validation.nameRequired');
				return value.trim().length > 150
					? t('validation.maxLength', { count: 150 })
					: null;
			},
			systemPrompt: (value) =>
				value.trim() ? null : t('validation.systemPromptRequired'),
			model: (value) => {
				if (!value.trim()) return t('validation.modelRequired');
				return value.trim().length > 100
					? t('validation.maxLength', { count: 100 })
					: null;
			},
			timeoutMs: (value) =>
				value !== '' && value < 1000 ? t('validation.timeoutMs') : null,
			metadata: (value) => {
				if (!value.trim()) return null;
				try {
					const parsed = JSON.parse(value);
					return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
						? null
						: t('validation.metadata');
				} catch {
					return t('validation.metadata');
				}
			},
		},
	});

	const { clearErrors, resetDirty, setValues } = form;

	useEffect(() => {
		setValues({
			name: evaluatorAgent?.name ?? '',
			systemPrompt: evaluatorAgent?.systemPrompt ?? '',
			provider: evaluatorAgent?.provider ?? 'OPENAI',
			model: evaluatorAgent?.model ?? '',
			isActive: evaluatorAgent?.isActive ?? true,
			temperature: numberFromParams(evaluatorAgent?.params, 'temperature'),
			maxTokens: numberFromParams(evaluatorAgent?.params, 'maxTokens'),
			timeoutMs: numberFromParams(evaluatorAgent?.params, 'timeoutMs'),
			metadata: evaluatorAgent?.metadata
				? JSON.stringify(evaluatorAgent.metadata, null, 2)
				: '',
		});
		resetDirty();
		clearErrors();
	}, [evaluatorAgent, clearErrors, resetDirty, setValues]);

	const submit = form.onSubmit(async (values) => {
		const timeoutMs = values.timeoutMs === '' ? '' : Number(values.timeoutMs);

		if (timeoutMs !== '' && (!Number.isFinite(timeoutMs) || timeoutMs < 1000)) {
			form.setFieldError('timeoutMs', t('validation.timeoutMs'));
			return;
		}

		const params: EvaluatorAgentParams = {};
		if (values.temperature !== '') params.temperature = values.temperature;
		if (values.maxTokens !== '') params.maxTokens = values.maxTokens;
		if (timeoutMs !== '') params.timeoutMs = timeoutMs;

		const metadata = values.metadata.trim()
			? (JSON.parse(values.metadata) as Record<string, unknown>)
			: evaluatorAgent
				? null
				: undefined;

		const payload: CreateEvaluatorAgentPayload = {
			name: values.name.trim(),
			systemPrompt: values.systemPrompt.trim(),
			provider: values.provider,
			model: values.model.trim(),
			isActive: values.isActive,
			params: Object.keys(params).length
				? params
				: evaluatorAgent
					? null
					: undefined,
			metadata,
		};

		try {
			await onSubmit(payload);
		} catch (error) {
			if (isApiError(error) && error.response.data.statusCode === 409) {
				form.setFieldError('name', t('validation.duplicate'));
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
					label={t('form.name')}
					maxLength={150}
					placeholder={t('form.namePlaceholder')}
					required
					size='sm'
					{...form.getInputProps('name')}
				/>
				<Textarea
					autosize
					label={t('form.systemPrompt')}
					minRows={4}
					placeholder={t('form.systemPromptPlaceholder')}
					required
					size='sm'
					{...form.getInputProps('systemPrompt')}
				/>
				<Group grow>
					<Select
						allowDeselect={false}
						data={PROVIDER_OPTIONS.map((provider) => ({
							label: t(`providers.${provider.toLowerCase()}`),
							value: provider,
						}))}
						label={t('form.provider')}
						size='sm'
						{...form.getInputProps('provider')}
					/>
					<TextInput
						label={t('form.model')}
						maxLength={100}
						placeholder={t('form.modelPlaceholder')}
						required
						size='sm'
						{...form.getInputProps('model')}
					/>
				</Group>

				<Divider label={t('form.advanced')} labelPosition='left' my='xs' />

				<Group grow>
					<NumberInput
						allowNegative={false}
						decimalScale={2}
						label={t('form.temperature')}
						max={2}
						min={0}
						placeholder={t('form.temperaturePlaceholder')}
						size='sm'
						step={0.1}
						{...form.getInputProps('temperature')}
					/>
					<NumberInput
						allowNegative={false}
						label={t('form.maxTokens')}
						min={1}
						placeholder={t('form.maxTokensPlaceholder')}
						size='sm'
						{...form.getInputProps('maxTokens')}
					/>
					<NumberInput
						allowNegative={false}
						clampBehavior='strict'
						label={t('form.timeoutMs')}
						min={1000}
						placeholder={t('form.timeoutMsPlaceholder')}
						size='sm'
						step={1000}
						{...form.getInputProps('timeoutMs')}
					/>
				</Group>
				<Textarea
					autosize
					description={t('form.metadataHint')}
					label={t('form.metadata')}
					minRows={2}
					placeholder={t('form.metadataPlaceholder')}
					size='sm'
					{...form.getInputProps('metadata')}
				/>
				<Switch
					label={t('form.isActive')}
					size='sm'
					{...form.getInputProps('isActive', { type: 'checkbox' })}
				/>

				<Text c='dimmed' size='xs'>
					{t('form.modelHint')}
				</Text>

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
						{evaluatorAgent ? t('actions.save') : t('actions.create')}
					</Button>
				</Group>
			</Stack>
		</form>
	);
}
