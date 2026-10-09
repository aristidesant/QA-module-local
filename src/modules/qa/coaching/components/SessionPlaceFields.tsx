import { useState, type ReactNode } from 'react';
import { Stack, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import type { CoachingSessionModality } from '~/models/qa';
import { SESSION_MODALITIES } from '../constants';
import { MeetingLocationModal } from './MeetingLocationModal';

interface SessionPlaceFieldsProps {
	modality: CoachingSessionModality;
	/** Where an in-person session takes place. */
	location: string;
	/** Call link of a virtual session. */
	meetingLink: string;
	onModalityChange: (modality: CoachingSessionModality) => void;
	onLocationChange: (location: string) => void;
	onMeetingLinkChange: (link: string) => void;
	locationError?: ReactNode;
	meetingLinkError?: ReactNode;
}

/**
 * In person or virtual, and the detail that goes with it. Both show a plain
 * input, typed into directly: where it takes place, or the meeting link.
 * Switching to In person with no location yet also opens a modal that asks
 * for it, as a prompt; the input stays the place to read and edit it.
 */
export function SessionPlaceFields({
	modality,
	location,
	meetingLink,
	onModalityChange,
	onLocationChange,
	onMeetingLinkChange,
	locationError,
	meetingLinkError,
}: SessionPlaceFieldsProps) {
	const { t } = useTranslation('qa.coaching');
	const [modalOpen, setModalOpen] = useState(false);

	return (
		<Stack gap='sm'>
			<AppSegmentedControl
				size='sm'
				value={modality}
				onChange={(v) => {
					const next = v as CoachingSessionModality;
					onModalityChange(next);
					// Switching to In person with nothing typed yet asks where, once.
					if (
						next === 'IN_PERSON' &&
						modality !== 'IN_PERSON' &&
						!location.trim()
					) {
						setModalOpen(true);
					}
				}}
				data={SESSION_MODALITIES.map((m) => ({
					value: m,
					label: t(`sessions.modality.${m}`),
				}))}
			/>

			{modality === 'IN_PERSON' ? (
				<TextInput
					label={t('sessions.place.where')}
					placeholder={t('sessions.place.locationPlaceholder')}
					maxLength={120}
					value={location}
					error={locationError}
					onChange={(e) => onLocationChange(e.currentTarget.value)}
				/>
			) : (
				<TextInput
					label={t('sessions.editor.meetingLink')}
					placeholder={t('sessions.editor.meetingLinkPlaceholder')}
					value={meetingLink}
					error={meetingLinkError}
					onChange={(e) => onMeetingLinkChange(e.currentTarget.value)}
				/>
			)}

			<MeetingLocationModal
				opened={modalOpen}
				onClose={() => setModalOpen(false)}
				value={location}
				onConfirm={onLocationChange}
			/>
		</Stack>
	);
}
