import { useState } from 'react';
import { Badge, Button, Group, Paper, Stack, Text, Textarea } from '@mantine/core';
import { IconNote, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '~/components/SectionCard';
import { formatDateTime } from '~/modules/qa/team/helpers';
import type { CustomerNote } from '../types';

interface CustomerNotesPanelProps {
	notes: CustomerNote[];
	onAdd: (text: string) => void;
	autoFocus?: boolean;
}

export function CustomerNotesPanel({ notes, onAdd, autoFocus }: CustomerNotesPanelProps) {
	const { t } = useTranslation('qa.customers');
	const [text, setText] = useState('');

	const handleAdd = () => {
		if (!text.trim()) return;
		onAdd(text.trim());
		setText('');
	};

	return (
		<SectionCard title={t('timeline.notes')} description={t('timeline.notesDescription')} icon={IconNote}>
			<Stack gap='sm'>
				<Textarea
					autosize
					minRows={2}
					autoFocus={autoFocus}
					placeholder={t('timeline.notePlaceholder')}
					value={text}
					onChange={(e) => setText(e.currentTarget.value)}
				/>
				<Group justify='flex-end'>
					<Button size='xs' leftSection={<IconPlus size={14} />} onClick={handleAdd} disabled={!text.trim()}>
						{t('timeline.save')}
					</Button>
				</Group>
				<Stack gap='xs'>
					{[...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((note) => (
						<Paper key={note.id} withBorder p='sm'>
							<Group gap={6} mb={4}>
								<Text size='xs' fw={600}>{note.authorName}</Text>
								<Badge size='xs' variant='outline'>{note.authorRole}</Badge>
								<Text size='xs' c='dimmed'>{formatDateTime(note.createdAt)}</Text>
							</Group>
							<Text size='sm'>{note.text}</Text>
						</Paper>
					))}
				</Stack>
			</Stack>
		</SectionCard>
	);
}
