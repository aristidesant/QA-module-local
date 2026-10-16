import {
	Badge,
	Group,
	Stack,
	Switch,
	Text,
	TextInput,
	Textarea,
} from '@mantine/core';
import { IconFileDescription } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import SectionCard from '~/components/SectionCard';
import { MODALITY_COLORS } from '~/modules/qa/forms/constants';
import type { DraftError } from '~/modules/qa/forms/helpers';
import type { BuilderForm } from '~/modules/qa/forms/types';

export interface FormDetailsEditorProps {
	form: BuilderForm;
	error: DraftError | null;
	onChange: (
		changes: Partial<
			Pick<BuilderForm, 'name' | 'category' | 'description' | 'isActive'>
		>
	) => void;
}

export default function FormDetailsEditor({
	form,
	error,
	onChange,
}: FormDetailsEditorProps) {
	const { t } = useTranslation('qa.forms');
	const modalityKey = form.modality.toLowerCase();

	return (
		<SectionCard
			description={t('details.description')}
			icon={IconFileDescription}
			title={t('details.title')}
		>
			<Stack gap='sm'>
				<TextInput
					error={
						error?.key === 'nameRequired'
							? t('builder.validation.nameRequired')
							: undefined
					}
					label={t('fields.name')}
					maw={480}
					onChange={(event) => onChange({ name: event.currentTarget.value })}
					placeholder={t('fields.namePlaceholder')}
					required
					size='sm'
					value={form.name}
				/>
				<TextInput
					label={t('fields.category')}
					maw={320}
					onChange={(event) =>
						onChange({ category: event.currentTarget.value })
					}
					placeholder={t('fields.categoryPlaceholder')}
					size='sm'
					value={form.category}
				/>
				<Textarea
					autosize
					label={t('fields.description')}
					minRows={3}
					onChange={(event) =>
						onChange({ description: event.currentTarget.value })
					}
					placeholder={t('fields.descriptionPlaceholder')}
					size='sm'
					value={form.description}
				/>
				<Switch
					checked={form.isActive}
					label={t('fields.active')}
					onChange={(event) =>
						onChange({ isActive: event.currentTarget.checked })
					}
				/>
				<Group gap='xs'>
					<Text c='dimmed' size='sm'>
						{t('modality.label')}
					</Text>
					<Badge color={MODALITY_COLORS[form.modality]} variant='light'>
						{t(`modality.${modalityKey}`)}
					</Badge>
					<Text c='dimmed' size='xs'>
						{t(`modality.${modalityKey}Hint`)}
					</Text>
				</Group>
			</Stack>
		</SectionCard>
	);
}
