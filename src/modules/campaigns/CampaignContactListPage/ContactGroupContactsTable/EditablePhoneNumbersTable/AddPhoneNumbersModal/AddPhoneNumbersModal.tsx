import { useState, useCallback, useMemo } from 'react';
import {
	Modal,
	Group,
	Button,
	ActionIcon,
	TextInput,
	Text,
	Tooltip,
} from '@mantine/core';
import { IconPlus, IconX, IconDeviceFloppy } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useCreateContactPhoneNumbers } from '~/queries/contactsQueries';
import styles from './AddPhoneNumbersModal.module.css';

interface AddPhoneNumbersModalProps {
	contactId: number;
	contactGroupId: number;
	onClose: () => void;
	onSaved: () => void;
}

const phoneRegex = /^\+?[1-9]\d{7,14}$/; // Basic E.164 range check

const AddPhoneNumbersModal: React.FC<AddPhoneNumbersModalProps> = ({
	contactId,
	contactGroupId, // reserved if future validation needed
	onClose,
	onSaved,
}) => {
	const [phones, setPhones] = useState<string[]>(['']);
	const createMutation = useCreateContactPhoneNumbers();

	const setPhone = useCallback((index: number, value: string) => {
		setPhones((prev) => prev.map((p, i) => (i === index ? value : p)));
	}, []);

	const addRow = useCallback(() => {
		setPhones((prev) => [...prev, '']);
	}, []);

	const removeRow = useCallback((index: number) => {
		setPhones((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const cleanedPhones = useMemo(
		() => phones.map((p) => p.trim()).filter((p) => p.length > 0),
		[phones]
	);

	const hasDuplicates = useMemo(() => {
		const set = new Set<string>();
		for (const p of cleanedPhones) {
			if (set.has(p)) return true;
			set.add(p);
		}
		return false;
	}, [cleanedPhones]);

	const invalidPhones = useMemo(
		() => cleanedPhones.filter((p) => !phoneRegex.test(p)),
		[cleanedPhones]
	);

	const canSave =
		cleanedPhones.length > 0 &&
		invalidPhones.length === 0 &&
		!hasDuplicates &&
		!createMutation.isPending;

	const handleSave = useCallback(() => {
		if (!canSave) return;
		createMutation.mutate(
			{ contactId, phones: cleanedPhones },
			{
				onSuccess: () => {
					notifications.show({
						title: 'Added',
						message: `${cleanedPhones.length} phone number(s) added successfully`,
						color: 'green',
					});
					onSaved();
				},
				onError: (error) => {
					notifications.show({
						title: 'Add Failed',
						message:
							error instanceof Error
								? error.message
								: 'Failed to add phone numbers',
						color: 'red',
					});
				},
			}
		);
	}, [canSave, createMutation, contactId, cleanedPhones, onSaved]);

	return (
		<Modal opened onClose={onClose} title='Add Phone Numbers' size='md'>
			<Group gap='xs' mb='xs'>
				<Text size='xs' c='dimmed'>
					Enter one or more phone numbers in international format (E.164).
				</Text>
			</Group>
			<Group gap='xs' className={styles.rows}>
				{phones.map((value, index) => {
					const trimmed = value.trim();
					const hasValue = trimmed.length > 0;
					const isInvalid = hasValue && !phoneRegex.test(trimmed);
					return (
						<Group key={index} gap={4} className={styles.row} wrap='nowrap'>
							<TextInput
								value={value}
								onChange={(e) => setPhone(index, e.currentTarget.value)}
								placeholder='+18095551234'
								size='xs'
								className={styles.input}
								error={isInvalid ? 'Invalid format' : undefined}
							/>
							<ActionIcon
								variant='subtle'
								color='red'
								size='sm'
								onClick={() => removeRow(index)}
								aria-label='Remove'
							>
								<IconX size={14} />
							</ActionIcon>
						</Group>
					);
				})}
				<ActionIcon
					variant='light'
					color='blue'
					onClick={addRow}
					aria-label='Add row'
				>
					<IconPlus size={16} />
				</ActionIcon>
			</Group>
			{hasDuplicates && (
				<Text size='xs' c='red' mt='xs'>
					Duplicate numbers detected.
				</Text>
			)}
			{invalidPhones.length > 0 && !hasDuplicates && (
				<Text size='xs' c='red' mt='xs'>
					Fix invalid numbers before saving.
				</Text>
			)}
			<Group justify='space-between' mt='md'>
				<Button variant='subtle' size='xs' onClick={onClose}>
					Cancel
				</Button>
				<Tooltip label={canSave ? 'Save numbers' : 'Resolve errors to save'}>
					<Button
						variant='filled'
						leftSection={<IconDeviceFloppy size={14} />}
						size='xs'
						color='blue'
						onClick={handleSave}
						loading={createMutation.isPending}
						disabled={!canSave}
					>
						Save
					</Button>
				</Tooltip>
			</Group>
		</Modal>
	);
};

export default AddPhoneNumbersModal;
