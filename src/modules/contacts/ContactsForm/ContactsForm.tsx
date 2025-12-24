import { useEffect } from 'react';
import { useForm } from '@mantine/form';
import {
	Button,
	Group,
	Stack,
	Loader,
	TextInput,
	Select,
	SimpleGrid,
	Divider,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import {
	useCreateContact,
	useUpdateContact,
	useGetContact,
} from '~/queries/contactsQueries';
import type { Contact } from '~/models/ContactsModel';
import { IconDeviceFloppy } from '@tabler/icons-react';
import VariableDataEditor from '~/modules/contacts/VariableDataEditor';
import { useContactEditStore } from '~/stores/contactEditStore';

interface ContactsFormProps {
	mode: 'create' | 'edit';
	contactId: number | null;
	onSuccess: () => void;
}

export default function ContactsForm({
	mode,
	contactId,
	onSuccess,
}: ContactsFormProps) {
	const { t } = useTranslation();
	const { data: contact, isLoading: isLoadingContact } = useGetContact(
		contactId ? contactId.toString() : ''
	);
	const createContact = useCreateContact();
	const updateContact = useUpdateContact();
	const { variableData, setInitialVariableData } = useContactEditStore();

	// We keep local form shape broadened (includes helper fields like `email`)
	const form = useForm<any>({
		initialValues: {
			firstName: '',
			lastName: '',
			identifier: '',
			identifierType: null,
			birthDate: null,
			address: '',
			email: '', // single email input mapped to emails[]
			phoneNumbers: [], // used only on create
		},
		validate: {
			firstName: (value: string) => (value ? null : 'First name is required'),
			lastName: (value: string) => (value ? null : 'Last name is required'),
			phoneNumbers: (value: any[]) =>
				mode === 'edit'
					? null // allow empty during edit (handled elsewhere)
					: value && value.length > 0
						? null
						: 'At least one phone number is required',
		},
	});

	useEffect(() => {
		if (mode === 'edit' && contact) {
			form.setValues({
				firstName: contact.firstName,
				lastName: contact.lastName,
				identifier: contact.identifier,
				identifierType: contact.identifierType,
				birthDate: contact.birthDate,
				address: contact.address,
				email: contact.emails?.[0] || '',
				phoneNumbers: contact.phoneNumbers,
			});
			// Initialize variableData store from contact
			setInitialVariableData(contact.variableData?.contactData || {});
		} else if (mode === 'create') {
			form.reset();
			setInitialVariableData({});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode, contact]);

	const onSubmit = async (values: any) => {
		// Build sanitized payload for backend
		const payload: Partial<Contact> = {
			firstName: values.firstName,
			lastName: values.lastName,
			...(values.identifier ? { identifier: values.identifier } : {}),
			...(values.identifierType
				? { identifierType: values.identifierType }
				: {}),
			emails: values.email ? [values.email] : contact?.emails, // preserve existing if blank,
			...(values.address ? { address: values.address } : {}),
			...(values.birthDate ? { birthDate: values.birthDate } : {}),
		};

		try {
			if (mode === 'create') {
				// include phoneNumbers only on create if provided
				if (values.phoneNumbers && values.phoneNumbers.length > 0) {
					(payload as any).phoneNumbers = values.phoneNumbers;
				}
				await createContact.mutateAsync(payload);
				notifications.show({
					title: t('contacts.form.created'),
					message: 'The contact has been created successfully.',
					color: 'green',
				});
			} else if (mode === 'edit' && contactId) {
				await updateContact.mutateAsync({
					id: contactId.toString(),
					data: {
						...payload,
						// attach dynamic variables
						variableData: { contactData: variableData },
					},
				});
				notifications.show({
					title: t('contacts.form.updated'),
					message: 'Changes saved successfully.',
					color: 'green',
				});
			}
			onSuccess();
			form.reset();
		} catch (error) {
			notifications.show({
				title: t('common.error'),
				message:
					error instanceof Error
						? error.message
						: 'Failed to submit contact form.',
				color: 'red',
			});
		}
	};

	if (mode === 'edit' && isLoadingContact) {
		return (
			<Group justify='center' py='xl'>
				<Loader />
			</Group>
		);
	}

	return (
		<form onSubmit={form.onSubmit(onSubmit)}>
			<Stack gap={'xs'}>
				<SimpleGrid cols={{ base: 1, sm: 2 }}>
					<TextInput
						label='First Name'
						placeholder='Enter first name'
						{...form.getInputProps('firstName')}
						error={form.errors.firstName}
						required
					/>
					<TextInput
						label='Last Name'
						placeholder='Enter last name'
						{...form.getInputProps('lastName')}
						error={form.errors.lastName}
						required
					/>
					<TextInput
						label='Identifier'
						placeholder='Enter identifier'
						{...form.getInputProps('identifier')}
						error={form.errors.identifier}
					/>
					<Select
						label='Identifier Type'
						placeholder='Select identifier type'
						data={[
							{ value: 'PERSONAL_ID', label: 'National ID' },
							{
								value: 'PASSPORT',
								label: 'Passport',
							},
							{
								value: 'DRIVER_LICENSE',
								label: "Driver's License",
							},
						]}
						{...form.getInputProps('identifierType')}
						error={form.errors.identifierType}
						clearable
					/>
					<DateInput
						label='Birth Date'
						placeholder='Pick birth date'
						{...form.getInputProps('birthDate')}
						error={form.errors.birthDate}
						valueFormat='YYYY-MM-DD'
						clearable
					/>
					<TextInput
						label='Address'
						placeholder='Enter address'
						{...form.getInputProps('address')}
						error={form.errors.address}
					/>
					<TextInput
						label='Email'
						placeholder='Enter email'
						{...form.getInputProps('email')}
						error={form.errors.email}
						type='email'
					/>
					{/* <TextInput
						label='Phone'
						placeholder='Enter phone number'
						{...form.getInputProps('phone')}
						error={form.errors.phone}
						type='tel'
					/> */}
				</SimpleGrid>
				<VariableDataEditor title='Dynamic Variables' />
				<Divider />
				<Group justify='end' mt='md'>
					<Button
						type='submit'
						rightSection={<IconDeviceFloppy />}
						loading={createContact.isPending || updateContact.isPending}
						disabled={createContact.isPending || updateContact.isPending}
					>
						{mode === 'edit' ? 'Update' : 'Create'}
					</Button>
				</Group>
			</Stack>
		</form>
	);
}
