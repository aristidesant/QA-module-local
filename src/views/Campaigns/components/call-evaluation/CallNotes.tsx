import { useMemo, useState } from 'react';
import {
	ActionIcon,
	Badge,
	Button,
	Checkbox,
	Group,
	Paper,
	Stack,
	Text,
	Textarea,
	Tooltip,
	UnstyledButton,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
	IconNotes,
	IconPencil,
	IconPlayerPlay,
	IconTrash,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { CALL_NOTE_MAX_LENGTH, type CallNote } from '~/models/qa/callNotes';
import { MaskedText } from '~/modules/qa/privacy/components/MaskedText';
import { notifySuccess } from '~/modules/qa/utils/notifications';
import {
	authorForRole,
	selectNotes,
	useCallNotesStore,
} from '~/stores/qa/callNotesStore';
import { useRoleMockStore } from '~/stores/roleMockStore';
import { formatDuration } from './scoreColor';
import styles from './CallNotes.module.css';

const PAGE_SIZE = 10;

interface CallNotesProps {
	callId: string;
	/** Where the recording is now, so a note can point at it. */
	currentTime: number;
	/** Moves the recording to the second a note points at. */
	onJump: (seconds: number) => void;
}

const stamp = (iso: string) => dayjs(iso).format('D MMM YYYY, HH:mm');

/** Notes the review team leaves on a call: write, read, link to a moment of the recording, edit your own. */
export function CallNotes({ callId, currentTime, onJump }: CallNotesProps) {
	const { t } = useTranslation('qa.calls');
	const previewRole = useRoleMockStore((s) => s.previewRole);
	const allNotes = useCallNotesStore(selectNotes);
	const addNote = useCallNotesStore((s) => s.addNote);
	const editNote = useCallNotesStore((s) => s.editNote);
	const removeNote = useCallNotesStore((s) => s.removeNote);

	const me = authorForRole(previewRole);
	const canDeleteAny = me.role === 'qaManager' || me.role === 'superAdmin';

	const [draft, setDraft] = useState('');
	const [linkTime, setLinkTime] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editDraft, setEditDraft] = useState('');
	const [visible, setVisible] = useState(PAGE_SIZE);

	const notes = useMemo(
		() =>
			allNotes
				.filter((n) => n.callId === callId)
				.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
		[allNotes, callId]
	);

	const now = Math.floor(currentTime);
	const draftTooLong = draft.length > CALL_NOTE_MAX_LENGTH;
	const editTooLong = editDraft.length > CALL_NOTE_MAX_LENGTH;

	const submit = () => {
		const text = draft.trim();
		if (!text || draftTooLong) return;
		addNote({
			callId,
			text,
			author: me,
			seconds: linkTime ? now : undefined,
		});
		setDraft('');
		setLinkTime(false);
		notifySuccess(t('notes.added'));
	};

	const startEdit = (note: CallNote) => {
		setEditingId(note.id);
		setEditDraft(note.text);
	};

	const saveEdit = (note: CallNote) => {
		const text = editDraft.trim();
		if (!text || editTooLong) return;
		if (text !== note.text) {
			editNote(note.id, text);
			notifySuccess(t('notes.saved'));
		}
		setEditingId(null);
	};

	const confirmDelete = (note: CallNote) =>
		modals.openConfirmModal({
			title: t('notes.confirmDelete.title'),
			children: <Text size='sm'>{t('notes.confirmDelete.message')}</Text>,
			labels: {
				confirm: t('notes.confirmDelete.confirm'),
				cancel: t('notes.confirmDelete.cancel'),
			},
			confirmProps: { color: 'red' },
			onConfirm: () => {
				removeNote(note.id);
				notifySuccess(t('notes.deleted'));
			},
		});

	return (
		<SectionCard
			title={t('notes.title')}
			description={t('notes.description')}
			icon={IconNotes}
			headerActions={
				<Badge variant='light' color='gray'>
					{t('notes.count', { count: notes.length })}
				</Badge>
			}
		>
			<Stack gap='xs'>
				<Textarea
					aria-label={t('notes.field')}
					placeholder={t('notes.placeholder')}
					autosize
					minRows={2}
					value={draft}
					onChange={(e) => setDraft(e.currentTarget.value)}
					error={
						draftTooLong
							? t('notes.tooLong', { max: CALL_NOTE_MAX_LENGTH })
							: undefined
					}
				/>
				<Group justify='space-between' align='center' wrap='wrap' gap='sm'>
					<Checkbox
						size='sm'
						checked={linkTime}
						onChange={(e) => setLinkTime(e.currentTarget.checked)}
						label={t('notes.linkTime', { time: formatDuration(now) })}
					/>
					<Group gap='sm'>
						<Text size='xs' c='dimmed'>
							{draft.length}/{CALL_NOTE_MAX_LENGTH}
						</Text>
						<Button
							size='sm'
							leftSection={<IconNotes size={14} />}
							disabled={draft.trim().length === 0 || draftTooLong}
							onClick={submit}
						>
							{t('notes.add')}
						</Button>
					</Group>
				</Group>
			</Stack>

			{notes.length === 0 ? (
				<Text size='sm' c='dimmed'>
					{t('notes.empty')}
				</Text>
			) : (
				<Stack gap='xs'>
					{notes.slice(0, visible).map((note) => {
						const isMine = note.author.id === me.id;
						const editing = editingId === note.id;
						return (
							<Paper
								key={note.id}
								radius='sm'
								p='sm'
								className={styles.note}
								data-testid='call-note'
							>
								<Group
									justify='space-between'
									align='flex-start'
									wrap='nowrap'
									gap='xs'
									mb={4}
								>
									<Group gap='xs' wrap='wrap'>
										<Text size='sm' fw={600}>
											{note.author.name}
										</Text>
										<Badge size='xs' variant='outline' color='gray'>
											{t(`notes.roles.${note.author.role}`)}
										</Badge>
										<Text size='xs' c='dimmed'>
											{stamp(note.createdAt)}
										</Text>
										{note.editedAt && (
											<Text size='xs' c='dimmed'>
												· {t('notes.edited', { date: stamp(note.editedAt) })}
											</Text>
										)}
									</Group>
									{!editing && (isMine || canDeleteAny) && (
										<Group gap={2} wrap='nowrap'>
											{isMine && (
												<Tooltip label={t('notes.edit')} withArrow>
													<ActionIcon
														size='sm'
														variant='subtle'
														color='gray'
														aria-label={t('notes.edit')}
														onClick={() => startEdit(note)}
													>
														<IconPencil size={14} />
													</ActionIcon>
												</Tooltip>
											)}
											<Tooltip label={t('notes.delete')} withArrow>
												<ActionIcon
													size='sm'
													variant='subtle'
													color='gray'
													aria-label={t('notes.delete')}
													onClick={() => confirmDelete(note)}
												>
													<IconTrash size={14} />
												</ActionIcon>
											</Tooltip>
										</Group>
									)}
								</Group>

								{note.seconds !== undefined && (
									<UnstyledButton
										mb={4}
										aria-label={t('notes.jumpTo', {
											time: formatDuration(note.seconds),
										})}
										onClick={() => onJump(note.seconds ?? 0)}
									>
										<Group gap={4} wrap='nowrap'>
											<IconPlayerPlay size={12} />
											<Text size='xs' fw={500} className={styles.timeLink}>
												{formatDuration(note.seconds)}
											</Text>
										</Group>
									</UnstyledButton>
								)}

								{editing ? (
									<Stack gap='xs'>
										<Textarea
											aria-label={t('notes.field')}
											autosize
											minRows={2}
											value={editDraft}
											onChange={(e) => setEditDraft(e.currentTarget.value)}
											error={
												editTooLong
													? t('notes.tooLong', { max: CALL_NOTE_MAX_LENGTH })
													: undefined
											}
											data-autofocus
										/>
										<Group justify='flex-end' gap='xs'>
											<Button
												size='xs'
												variant='default'
												onClick={() => setEditingId(null)}
											>
												{t('notes.cancel')}
											</Button>
											<Button
												size='xs'
												disabled={editDraft.trim().length === 0 || editTooLong}
												onClick={() => saveEdit(note)}
											>
												{t('notes.save')}
											</Button>
										</Group>
									</Stack>
								) : (
									<Text size='sm' className={styles.text}>
										<MaskedText text={note.text} callId={callId} />
									</Text>
								)}
							</Paper>
						);
					})}
					{notes.length > visible && (
						<Group justify='center'>
							<Button
								size='xs'
								variant='subtle'
								color='gray'
								onClick={() => setVisible((v) => v + PAGE_SIZE)}
							>
								{t('notes.showMore', { count: notes.length - visible })}
							</Button>
						</Group>
					)}
				</Stack>
			)}
		</SectionCard>
	);
}
