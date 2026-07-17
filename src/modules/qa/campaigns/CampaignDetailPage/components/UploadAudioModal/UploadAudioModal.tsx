import {
	Alert,
	Button,
	FileInput,
	Group,
	Select,
	Stack,
	TextInput,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconMusic, IconUpload } from '@tabler/icons-react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { Modal as FormModal } from '@mantine/core';
import {
	AUDIO_MAX_SIZE_MB,
	CONVERSATION_SOURCES,
} from '../../../campaigns.constants';
import type { UploadAudioFormValues } from '../../CampaignDetailPage.types';

export interface UploadAudioModalProps {
	opened: boolean;
	onClose: () => void;
	form: UseFormReturnType<UploadAudioFormValues>;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	uploading: boolean;
}

export default function UploadAudioModal({
	opened,
	onClose,
	form,
	onSubmit,
	uploading,
}: UploadAudioModalProps) {
	const { t } = useTranslation('qa.campaigns');

	return (
		<FormModal
			onClose={onClose}
			opened={opened}
			size='md'
			title={t('detail.upload.title')}
		>
			<form onSubmit={onSubmit}>
				<Stack gap='sm'>
					<Alert color='blue' icon={<IconMusic size={16} />} variant='light'>
						{t('detail.upload.description', { size: AUDIO_MAX_SIZE_MB })}
					</Alert>
					<FileInput
						accept='audio/mpeg,.mp3'
						clearable
						label={t('detail.upload.fields.file')}
						placeholder={t('detail.upload.fields.filePlaceholder')}
						size='sm'
						{...form.getInputProps('file')}
					/>
					<TextInput
						label={t('detail.upload.fields.externalRef')}
						placeholder={t('detail.upload.fields.externalRefPlaceholder')}
						size='sm'
						{...form.getInputProps('externalRef')}
					/>
					<Select
						allowDeselect={false}
						data={CONVERSATION_SOURCES.map((source) => ({
							label: t(`source.${source.toLowerCase()}`),
							value: source,
						}))}
						label={t('detail.upload.fields.source')}
						size='sm'
						{...form.getInputProps('source')}
					/>
					<Group justify='flex-end'>
						<Button onClick={onClose} size='sm' variant='subtle'>
							{t('detail.upload.actions.cancel')}
						</Button>
						<Button
							leftSection={<IconUpload size={16} />}
							loading={uploading}
							size='sm'
							type='submit'
						>
							{t('detail.upload.actions.submit')}
						</Button>
					</Group>
				</Stack>
			</form>
		</FormModal>
	);
}
