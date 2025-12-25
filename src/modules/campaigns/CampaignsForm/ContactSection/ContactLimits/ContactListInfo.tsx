import {
	Flex,
	Group,
	Text,
	Card,
	Popover,
	Button,
	Box,
	TextInput,
	ActionIcon,
	Tooltip,
	ThemeIcon,
} from '@mantine/core';
import {
	IconCalendar,
	IconX,
	IconEdit,
	IconCheck,
	IconX as IconXCircle,
	IconList,
	IconAlertCircle,
} from '@tabler/icons-react';
import { DatePicker } from '@mantine/dates';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import classes from './ContactListInfo.module.css';
import dayjs from 'dayjs';
import { formatExpirationDate } from '~/utils/dateUtils';

interface ContactListInfoProps {
	/** Name of the contact list */
	listName: string;

	/** Expiration date of the list (YYYY-MM-DD string or null) */
	expirationDate?: string | null;

	/** Callback when expiration date is changed */
	onExpirationChange?: (date: string | null) => void;

	/** Callback when list name is changed */
	onNameChange?: (name: string) => void;

	/** Whether the name field should be readonly */
	readonly?: boolean;
}

export function ContactListInfo({
	listName,
	expirationDate,
	onExpirationChange,
	onNameChange,
	readonly = false,
}: ContactListInfoProps) {
	const { t } = useTranslation('campaigns');
	const [opened, setOpened] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editedName, setEditedName] = useState(listName);
	// Store the selected date as a YYYY-MM-DD string to avoid timezone issues
	const [selectedDate, setSelectedDate] = useState<string | null>(
		expirationDate || null
	);

	// Helper to get start of today in YYYY-MM-DD
	const getStartOfToday = () => dayjs().startOf('day').format('YYYY-MM-DD');

	useEffect(() => {
		setEditedName(listName);
	}, [listName]);

	const handleNameSave = () => {
		if (
			editedName?.trim() &&
			editedName.trim().length >= 3 &&
			editedName !== listName
		) {
			onNameChange?.(editedName.trim());
		}
		setIsEditing(false);
	};

	const handleCancelEdit = () => {
		setEditedName(listName);
		setIsEditing(false);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			handleNameSave();
		} else if (event.key === 'Escape') {
			handleCancelEdit();
		}
	};

	const handleDateChange = (dateString: string | null) => {
		// Store and pass the date as a simple YYYY-MM-DD string to avoid timezone issues
		setSelectedDate(dateString);
		onExpirationChange?.(dateString);
		setOpened(false);
	};

	// Update selectedDate when expirationDate prop changes
	useEffect(() => {
		setSelectedDate(expirationDate || null);
	}, [expirationDate]);

	const clearDate = (e: React.MouseEvent) => {
		e.stopPropagation();
		setSelectedDate(null);
		onExpirationChange?.(null);
	};

	const hasName = listName && listName.trim().length > 0;

	return (
		<Card
			withBorder
			className={`${classes.card} ${!hasName && !isEditing ? classes.cardEmpty : ''}`}
		>
			<Flex justify='space-between' align='center' gap='md'>
				<Group gap='md' style={{ flex: 1 }}>
					<ThemeIcon
						size='xl'
						radius='md'
						variant='light'
						color={hasName ? 'blue' : 'orange'}
						className={!hasName && !isEditing ? classes.iconPulse : ''}
					>
						{hasName ? <IconList size={20} /> : <IconAlertCircle size={20} />}
					</ThemeIcon>
					<Flex direction='column' style={{ flex: 1 }}>
						<Text
							size='xs'
							c={hasName ? 'dimmed' : 'orange'}
							tt='uppercase'
							fw={600}
							lh={1.2}
						>
							{hasName
								? t('form.contacts.info.nameLabel')
								: t('form.contacts.info.nameRequired')}
						</Text>
						{isEditing ? (
							<Group gap='xs' align='center' mt={4}>
								<TextInput
									value={editedName}
									onChange={(e) =>
										setEditedName(
											e.currentTarget.value
												.replace(/[^A-Za-z\s\d-]/g, '')
												.replace(/\s+/g, ' ')
												.slice(0, 50)
										)
									}
									placeholder={t('form.contacts.info.namePlaceholder')}
									description={t('form.contacts.info.nameDescription')}
									autoFocus
									size='sm'
									onKeyDown={handleKeyDown}
									className={classes.nameInput}
									maxLength={50}
								/>
								<Tooltip label={t('save', { ns: 'common' })}>
									<ActionIcon
										variant='light'
										color='green'
										onClick={handleNameSave}
										size='sm'
										disabled={
											!editedName?.trim() || editedName.trim().length < 3
										}
									>
										<IconCheck size={14} />
									</ActionIcon>
								</Tooltip>
								<Tooltip label={t('cancel', { ns: 'common' })}>
									<ActionIcon
										variant='light'
										color='red'
										onClick={handleCancelEdit}
										size='sm'
									>
										<IconXCircle size={14} />
									</ActionIcon>
								</Tooltip>
							</Group>
						) : hasName ? (
							<Group gap='xs' align='center'>
								<Text fw={600} size='sm' className={classes.listName}>
									{listName}
								</Text>
								{onNameChange && !readonly && (
									<Tooltip label={t('form.contacts.info.editName')}>
										<ActionIcon
											variant='subtle'
											size='xs'
											color='gray'
											onClick={() => setIsEditing(true)}
											className={classes.editButton}
										>
											<IconEdit size={12} />
										</ActionIcon>
									</Tooltip>
								)}
							</Group>
						) : (
							<Box
								className={classes.emptyNameBox}
								onClick={() => !readonly && onNameChange && setIsEditing(true)}
							>
								<Text className={classes.placeholderText}>
									{t('form.contacts.info.clickToAddName')}
								</Text>
							</Box>
						)}
					</Flex>
				</Group>
				{onExpirationChange && (
					<Popover
						opened={opened}
						onChange={setOpened}
						onDismiss={() => setOpened(false)}
						position='bottom'
						withArrow
						shadow='md'
						width={300}
					>
						<Popover.Target>
							<Button
								variant='subtle'
								size='sm'
								c={expirationDate ? 'green' : 'blue'}
								className={classes.dateButton}
								leftSection={<IconCalendar size={16} stroke={1.5} />}
								rightSection={
									expirationDate ? (
										<Box
											component='span'
											onClick={clearDate}
											className={classes.clearButton}
										>
											<IconX size={14} />
										</Box>
									) : null
								}
								onClick={() => setOpened((o) => !o)}
							>
								{expirationDate
									? `${t('form.contacts.info.expires')}: ${formatExpirationDate(expirationDate)}`
									: t('form.contacts.info.addExpiration')}
							</Button>
						</Popover.Target>
						<Popover.Dropdown>
							<DatePicker
								value={selectedDate}
								onChange={(dateString) => {
									// Mantine v8 DatePicker already returns YYYY-MM-DD string format
									// Pass it directly to avoid any timezone conversion issues
									handleDateChange(dateString);
								}}
								minDate={getStartOfToday()}
								firstDayOfWeek={0}
								allowDeselect
								size='sm'
								styles={{
									day: {
										'&[data-selected]': {
											backgroundColor: 'var(--mantine-color-blue-6)',
										},
										'&[data-selected]:hover': {
											backgroundColor: 'var(--mantine-color-blue-7)',
										},
									},
								}}
							/>
							<Group justify='space-between' mt='md'>
								<Text size='xs' c='dimmed'>
									{expirationDate &&
									dayjs(expirationDate).isBefore(dayjs().startOf('day'), 'day')
										? t('form.contacts.info.dateInPast')
										: t('form.contacts.info.selectExpiration')}
								</Text>
								<Button
									variant='subtle'
									size='xs'
									onClick={() => setOpened(false)}
								>
									{t('actions.close', { ns: 'common' })}
								</Button>
							</Group>
						</Popover.Dropdown>
					</Popover>
				)}
			</Flex>
		</Card>
	);
}
