import {
	Button,
	Group,
	Select,
	Stack,
	TextInput,
	Textarea,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import type { FormEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal as FormModal } from '@mantine/core';
import { CONVERSATION_SOURCES } from '../../campaigns.constants';
import type { CampaignFormValues } from '../../campaigns.types';

export interface CampaignFormModalProps {
	opened: boolean;
	onClose: () => void;
	title: string;
	form: UseFormReturnType<CampaignFormValues>;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	saving: boolean;
	submitLabel: string;
	submitIcon: ReactNode;
}

export default function CampaignFormModal({
	opened,
	onClose,
	title,
	form,
	onSubmit,
	saving,
	submitLabel,
	submitIcon,
}: CampaignFormModalProps) {
	const { t } = useTranslation('qa.campaigns');

	return (
		<FormModal onClose={onClose} opened={opened} size='md' title={title}>
			<form onSubmit={onSubmit}>
				<Stack gap='sm'>
					<TextInput
						label={t('campaignForm.fields.name')}
						placeholder={t('campaignForm.fields.namePlaceholder')}
						size='sm'
						{...form.getInputProps('name')}
					/>
					<Select
						allowDeselect={false}
						data={[
							{ label: t('status.active'), value: 'ACTIVE' },
							{ label: t('status.inactive'), value: 'INACTIVE' },
						]}
						label={t('campaignForm.fields.status')}
						size='sm'
						{...form.getInputProps('status')}
					/>
					<Textarea
						autosize
						label={t('campaignForm.fields.description')}
						minRows={3}
						placeholder={t('campaignForm.fields.descriptionPlaceholder')}
						size='sm'
						{...form.getInputProps('description')}
					/>
					<Select
						clearable
						data={CONVERSATION_SOURCES.map((source) => ({
							label: t(`source.${source.toLowerCase()}`),
							value: source,
						}))}
						label={t('campaignForm.fields.source')}
						placeholder={t('campaignForm.fields.sourcePlaceholder')}
						size='sm'
						{...form.getInputProps('source')}
					/>
					<Group justify='flex-end'>
						<Button onClick={onClose} size='sm' variant='subtle'>
							{t('campaignForm.actions.cancel')}
						</Button>
						<Button
							leftSection={submitIcon}
							loading={saving}
							size='sm'
							type='submit'
						>
							{submitLabel}
						</Button>
					</Group>
				</Stack>
			</form>
		</FormModal>
	);
}
