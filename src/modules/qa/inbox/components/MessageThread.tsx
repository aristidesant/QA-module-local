import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Group, Paper, Stack, Text, Textarea } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type {
	AgentNotification,
	NotificationRecipientRole,
} from '~/models/qa/notifications';
import styles from './Inbox.module.css';

interface MessageThreadProps {
	replies: NonNullable<AgentNotification['replies']>;
	/** The role reading the thread — their own replies align right. */
	viewerRole: NotificationRecipientRole;
	onSend: (message: string) => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
	replies,
	viewerRole,
	onSend,
}) => {
	const { t } = useTranslation('qa.inbox');
	const [draft, setDraft] = useState('');

	const send = () => {
		const text = draft.trim();
		if (!text) return;
		onSend(text);
		setDraft('');
	};

	return (
		<Stack gap='sm'>
			<Text fw={600} size='sm'>
				{t('drawer.thread')}
			</Text>

			{replies.length === 0 ? (
				<Text size='sm' c='dimmed'>
					{t('drawer.noReplies')}
				</Text>
			) : (
				<div className={styles.thread}>
					{replies.map((reply) => {
						const own = reply.fromRole === viewerRole;
						return (
							<Paper
								key={reply.id}
								withBorder
								p='sm'
								radius='md'
								className={`${styles.bubble} ${own ? styles.bubbleOwn : ''}`}
							>
								<Group justify='space-between' gap='sm' mb={2}>
									<Text size='xs' fw={600}>
										{t(`sources.${reply.fromRole}`)}
									</Text>
									<Text size='xs' c='dimmed'>
										{dayjs(reply.createdAt).format('DD MMM · HH:mm')}
									</Text>
								</Group>
								<Text size='sm' className={styles.message}>
									{reply.message}
								</Text>
							</Paper>
						);
					})}
				</div>
			)}

			<Textarea
				placeholder={t('drawer.replyPlaceholder')}
				value={draft}
				onChange={(e) => setDraft(e.currentTarget.value)}
				autosize
				minRows={2}
			/>
			<Group justify='flex-end'>
				<Button
					size='sm'
					leftSection={<IconSend size={16} />}
					onClick={send}
					disabled={!draft.trim()}
				>
					{t('drawer.send')}
				</Button>
			</Group>
		</Stack>
	);
};

export default MessageThread;
