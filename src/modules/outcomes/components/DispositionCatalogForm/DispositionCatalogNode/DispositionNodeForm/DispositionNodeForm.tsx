import {
	Modal,
	TextInput,
	Select,
	Switch,
	Button,
	Group,
	Stack,
	Divider,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import type { DispositionNode } from '~/models/DispositionNodeModel';
import { ContactOutcome } from '~/models/ContactsModel';
import { useEffect } from 'react';

export type DispositionNodeFormValues = {
	name: string;
	description?: string;
	isInvalidatesNumber: boolean;
	doNotCall: boolean;
	requiresReschedule: boolean;
	isFinal: boolean;
	isVoiceMail: boolean;
	isAbandoned: boolean;
	contactOutcome: string | null;
	applyContactOutcomeToDescendants: boolean;
};

interface DispositionNodeFormProps {
	opened: boolean;
	onClose: () => void;
	onSubmit: (values: DispositionNodeFormValues) => void;
	initialValues?: Partial<DispositionNode>;
	title?: string;
	catalogType?: 'INBOUND' | 'OUTBOUND';
	hasChildren?: boolean;
	/** When true only the contactOutcome field is shown (protected root nodes). */
	protectedMode?: boolean;
}

const DispositionNodeForm: React.FC<DispositionNodeFormProps> = ({
	opened,
	onClose,
	onSubmit,
	initialValues,
	title,
	catalogType,
	hasChildren,
	protectedMode,
}) => {
	const { t } = useTranslation('outcomes');
	const isOutbound = catalogType === 'OUTBOUND';

	const contactOutcomeOptions = [
		{
			value: ContactOutcome.EFFECTIVE,
			label: t('form.fields.contactOutcomeEffective'),
		},
		{
			value: ContactOutcome.NOT_EFFECTIVE,
			label: t('form.fields.contactOutcomeNotEffective'),
		},
		{
			value: ContactOutcome.NO_CONTACT,
			label: t('form.fields.contactOutcomeNoContact'),
		},
	];

	const form = useForm<DispositionNodeFormValues>({
		initialValues: {
			name: '',
			description: '',
			isInvalidatesNumber: false,
			doNotCall: false,
			requiresReschedule: false,
			isFinal: false,
			isVoiceMail: false,
			isAbandoned: false,
			contactOutcome: null,
			applyContactOutcomeToDescendants: false,
		},
		validate: {
			contactOutcome: (value) =>
				isOutbound && !value ? t('form.fields.contactOutcomeRequired') : null,
		},
	});

	useEffect(() => {
		form.setValues({
			name: initialValues?.name || '',
			description: initialValues?.description || '',
			isInvalidatesNumber: initialValues?.isInvalidatesNumber || false,
			doNotCall:
				initialValues?.doNotCall ?? initialValues?.do_not_call ?? false,
			requiresReschedule: initialValues?.requiresReschedule || false,
			isFinal: initialValues?.isFinal || false,
			isVoiceMail:
				initialValues?.isVoiceMail ?? initialValues?.is_voice_mail ?? false,
			isAbandoned: initialValues?.isAbandoned ?? false,
			contactOutcome: initialValues?.contactOutcome ?? null,
			applyContactOutcomeToDescendants: false,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialValues]);

	const showApplyToDescendants =
		hasChildren && form.values.contactOutcome !== null;

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={title || t('form.defaultTitle')}
			centered
			size='lg'
		>
			<form onSubmit={form.onSubmit(onSubmit)}>
				<Stack gap='md'>
					{!protectedMode && (
						<Stack gap='xs'>
							<TextInput
								label={t('form.fields.name')}
								required
								{...form.getInputProps('name')}
							/>
							<TextInput
								label={t('form.fields.description')}
								{...form.getInputProps('description')}
							/>
						</Stack>
					)}
					<Stack gap='xs'>
						<Select
							label={t('form.fields.contactOutcome')}
							placeholder={t('form.fields.contactOutcomePlaceholder')}
							data={contactOutcomeOptions}
							clearable={!isOutbound && !protectedMode}
							required={isOutbound || protectedMode}
							{...form.getInputProps('contactOutcome')}
						/>
						{showApplyToDescendants && (
							<Switch
								label={t('form.fields.applyContactOutcomeToDescendants')}
								description={t(
									'form.fields.applyContactOutcomeToDescendantsDescription'
								)}
								{...form.getInputProps('applyContactOutcomeToDescendants', {
									type: 'checkbox',
								})}
							/>
						)}
					</Stack>
					{!protectedMode && (
						<>
							<Divider />
							<Stack gap='xs'>
								<Switch
									label={t('form.fields.doNotCall')}
									description={t('form.fields.doNotCallDescription')}
									{...form.getInputProps('doNotCall', { type: 'checkbox' })}
								/>
								<Switch
									label={t('form.fields.isAbandoned')}
									description={t('form.fields.isAbandonedDescription')}
									{...form.getInputProps('isAbandoned', { type: 'checkbox' })}
								/>
								<Switch
									label={t('form.fields.invalidatesNumber')}
									{...form.getInputProps('isInvalidatesNumber', {
										type: 'checkbox',
									})}
								/>
								<Switch
									label={t('form.fields.requiresReschedule')}
									{...form.getInputProps('requiresReschedule', {
										type: 'checkbox',
									})}
								/>
							</Stack>
							<Divider />
							<Stack gap='xs'>
								<Switch
									label={t('form.fields.isFinal')}
									{...form.getInputProps('isFinal', { type: 'checkbox' })}
								/>
								<Switch
									label={t('form.fields.isVoiceMail')}
									{...form.getInputProps('isVoiceMail', { type: 'checkbox' })}
								/>
							</Stack>
						</>
					)}
					<Group justify='flex-end' gap='xs'>
						<Button size='sm' variant='default' onClick={onClose} type='button'>
							{t('actions.cancel', { ns: 'common' })}
						</Button>
						<Button size='sm' type='submit'>
							{t('actions.save', { ns: 'common' })}
						</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
};

export default DispositionNodeForm;
