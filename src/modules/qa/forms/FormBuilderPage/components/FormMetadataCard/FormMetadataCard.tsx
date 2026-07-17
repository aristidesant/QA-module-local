import {
	Button,
	Group,
	Stack,
	Switch,
	TextInput,
	Textarea,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconDeviceFloppy, IconInfoCircle } from '@tabler/icons-react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import SectionCard from '~/components/SectionCard';
import type { UpdateFormPayload } from '~/models/qa';

export interface FormMetadataCardProps {
	form: UseFormReturnType<UpdateFormPayload>;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	saving: boolean;
}

export default function FormMetadataCard({
	form,
	onSubmit,
	saving,
}: FormMetadataCardProps) {
	const { t } = useTranslation('qa.forms');

	return (
		<SectionCard
			description={t('metadata.description')}
			icon={IconInfoCircle}
			title={t('metadata.title')}
		>
			<form onSubmit={onSubmit}>
				<Stack gap='sm'>
					<TextInput
						label={t('fields.name')}
						size='sm'
						{...form.getInputProps('name')}
					/>
					<TextInput
						label={t('fields.category')}
						size='sm'
						{...form.getInputProps('category')}
					/>
					<Textarea
						autosize
						label={t('fields.description')}
						minRows={3}
						size='sm'
						{...form.getInputProps('description')}
					/>
					<Switch
						label={t('fields.active')}
						size='sm'
						{...form.getInputProps('isActive', {
							type: 'checkbox',
						})}
					/>
					<Group justify='flex-end'>
						<Button
							leftSection={<IconDeviceFloppy size={16} />}
							loading={saving}
							size='sm'
							type='submit'
						>
							{t('actions.save')}
						</Button>
					</Group>
				</Stack>
			</form>
		</SectionCard>
	);
}
