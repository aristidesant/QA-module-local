import { useState } from 'react';
import { ActionIcon, Badge, Button, Group, Paper, Stack, Text, Textarea } from '@mantine/core';
import { IconNote, IconPin, IconPinnedOff, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import type { SupervisorNote } from '../types';
import { formatDateTime } from '../helpers';

interface NotesPanelProps {
	notes: SupervisorNote[];
	onAdd: (text: string) => void;
	onTogglePin: (id: string) => void;
}

export function NotesPanel({ notes, onAdd, onTogglePin }: NotesPanelProps) {
	const { t } = useTranslation('qa.team');
	const [text, setText] = useState('');

	const sorted = [...notes].sort((a, b) => {
		if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
		return b.createdAt.localeCompare(a.createdAt);
	});

	const handleAdd = () => {
		if (!text.trim()) return;
		onAdd(text.trim());
		setText('');
	};

	return (
		<SectionCard title={t('activity.notes')} description={t('activity.notesDescription')} icon={IconNote}>
			<Stack gap='sm'>
				<Textarea
					autosize
					minRows={2}
					placeholder={t('activity.notePlaceholder')}
					value={text}
					onChange={(e) => setText(e.currentTarget.value)}
				/>
				<Group justify='flex-end'>
					<Button size='xs' leftSection={<IconPlus size={14} />} onClick={handleAdd} disabled={!text.trim()}>
						{t('activity.save')}
					</Button>
				</Group>
				<Stack gap='xs'>
					{sorted.map((note) => (
						<Paper key={note.id} withBorder p='sm' bg={note.pinned ? 'var(--mantine-color-yellow-light)' : undefined}>
							<Group justify='space-between' mb={4}>
								<Group gap={6}>
									<Text size='xs' fw={600}>{note.authorName}</Text>
									<Badge size='xs' variant='outline'>{note.authorRole}</Badge>
									<Text size='xs' c='dimmed'>{formatDateTime(note.createdAt)}</Text>
								</Group>
								<ActionIcon variant='subtle' size='sm' onClick={() => onTogglePin(note.id)}>
									{note.pinned ? <IconPinnedOff size={14} /> : <IconPin size={14} />}
								</ActionIcon>
							</Group>
							<Text size='sm'>{note.text}</Text>
						</Paper>
					))}
				</Stack>
			</Stack>
		</SectionCard>
	);
}
