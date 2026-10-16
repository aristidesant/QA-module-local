import {
	Button,
	Group,
	Modal,
	SegmentedControl,
	Select,
	Stack,
	Text,
	TextInput,
	Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_MODALITIES } from '~/modules/qa/forms/constants';
import type { CreateFormValues, FormModality } from '~/modules/qa/forms/types';

export interface CreateFormModalProps {
	opened: boolean;
	initialModality: FormModality;
	/** Categories already saved on the user's forms; the user can only pick from these. */
	categories: string[];
	onClose: () => void;
	onSubmit: (values: CreateFormValues) => void;
}

export default function CreateFormModal({
	opened,
	initialModality,
	categories,
	onClose,
	onSubmit,
}: CreateFormModalProps) {
	const { t } = useTranslation('qa.forms');
	const form = useForm<CreateFormValues>({
		initialValues: {
			name: '',
			modality: initialModality,
			category: '',
			description: '',
		},
		validate: {
			name: (value) =>
				value.trim().length === 0 ? t('validation.nameRequired') : null,
		},
	});
	const { setValues, resetDirty, clearErrors } = form;

	// Start every opening from a clean form with the modality the user came from.
	useEffect(() => {
		if (!opened) return;
		setValues({
			name: '',
			modality: initialModality,
			category: '',
			description: '',
		});
		resetDirty();
		clearErrors();
	}, [opened, initialModality, setValues, resetDirty, clearErrors]);

	const modalityKey = form.values.modality.toLowerCase();

	return (
		<Modal
			centered
			onClose={onClose}
			opened={opened}
			size='md'
			title={t('create.title')}
		>
			<form onSubmit={form.onSubmit((values) => onSubmit(values))}>
				<Stack gap='sm'>
					<TextInput
						data-autofocus
						label={t('fields.name')}
						placeholder={t('fields.namePlaceholder')}
						required
						size='sm'
						{...form.getInputProps('name')}
					/>

					<Stack gap={4}>
						<Text fw={500} size='sm'>
							{t('create.modality')}
						</Text>
						<SegmentedControl
							data={FORM_MODALITIES.map((modality) => ({
								value: modality,
								label: t(`modality.${modality.toLowerCase()}`),
							}))}
							fullWidth
							size='sm'
							{...form.getInputProps('modality')}
						/>
						<Text c='dimmed' size='xs'>
							{t(`modality.${modalityKey}Hint`)}
						</Text>
						<Text c='dimmed' size='xs'>
							{t('create.modalityHint')}
						</Text>
					</Stack>

					<Select
						clearable
						data={categories}
						label={t('fields.category')}
						nothingFoundMessage={t('category.empty')}
						onChange={(category) =>
							form.setFieldValue('category', category ?? '')
						}
						placeholder={t('category.placeholder')}
						searchable
						size='sm'
						value={form.values.category || null}
					/>
					<Textarea
						autosize
						label={t('fields.description')}
						minRows={3}
						placeholder={t('fields.descriptionPlaceholder')}
						size='sm'
						{...form.getInputProps('description')}
					/>

					<Group justify='flex-end'>
						<Button onClick={onClose} size='sm' variant='subtle'>
							{t('actions.cancel')}
						</Button>
						<Button
							leftSection={<IconPlus size={16} />}
							size='sm'
							type='submit'
						>
							{t('create.submit')}
						</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
}
