import { useEffect, useState } from 'react';
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface MeetingLocationModalProps {
	opened: boolean;
	onClose: () => void;
	/** Location already typed, so reopening the modal edits it. */
	value: string;
	onConfirm: (location: string) => void;
}

/** Asks the supervisor where an in-person session takes place, e.g. "2nd floor meeting room". */
export function MeetingLocationModal({
	opened,
	onClose,
	value,
	onConfirm,
}: MeetingLocationModalProps) {
	const { t } = useTranslation('qa.coaching');
	const [draft, setDraft] = useState(value);

	// Every time the modal opens it starts from the location already chosen.
	useEffect(() => {
		if (opened) setDraft(value);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [opened]);

	const confirm = () => {
		const location = draft.trim();
		if (!location) return;
		onConfirm(location);
		onClose();
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={t('sessions.place.modalTitle')}
			centered
			size='md'
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					confirm();
				}}
			>
				<Stack gap='md'>
					<TextInput
						data-autofocus
						label={t('sessions.place.locationLabel')}
						description={t('sessions.place.modalHint')}
						placeholder={t('sessions.place.locationPlaceholder')}
						maxLength={120}
						value={draft}
						onChange={(e) => setDraft(e.currentTarget.value)}
					/>
					<Group justify='flex-end' gap='xs'>
						<Button variant='default' onClick={onClose}>
							{t('common.cancel')}
						</Button>
						<Button type='submit' disabled={!draft.trim()}>
							{t('sessions.place.save')}
						</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
}
