import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	Avatar,
	Button,
	Group,
	Paper,
	Stack,
	Text,
	Textarea,
} from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type {
	AgentNotification,
	NotificationRecipientRole,
} from '~/models/qa/notifications';
import { personNameOf } from '../constants';
import styles from './Inbox.module.css';

type Reply = NonNullable<AgentNotification['replies']>[number];

interface ThreadMessage {
	id: string;
	fromId?: string;
	fromRole: AgentNotification['sourceRole'] | Reply['fromRole'];
	message: string;
	createdAt: string;
}

interface MessageThreadProps {
	/** The message that opened the conversation, shown as the first bubble when given. */
	original?: Omit<ThreadMessage, 'id'>;
	replies: Reply[];
	/** The role reading the thread; their own messages align right. */
	viewerRole: NotificationRecipientRole;
	viewerId: string;
	/** Who a new reply goes to, named in the composer. */
	replyTo: string;
	onSend: (message: string) => void;
}

/** A chat between people: avatar, name, role and time per bubble, the reader's own on the right. */
export const MessageThread: React.FC<MessageThreadProps> = ({
	original,
	replies,
	viewerRole,
	viewerId,
	replyTo,
	onSend,
}) => {
	const { t } = useTranslation('qa.inbox');
	const [draft, setDraft] = useState('');

	const messages: ThreadMessage[] = [
		...(original ? [{ id: 'original', ...original }] : []),
		...replies,
	];

	const send = () => {
		const text = draft.trim();
		if (!text) return;
		onSend(text);
		setDraft('');
	};

	return (
		<Stack gap='sm'>
			{messages.length === 0 ? (
				<Text size='sm' c='dimmed'>
					{t('drawer.noReplies')}
				</Text>
			) : (
				<div className={styles.thread}>
					{messages.map((message) => {
						const own =
							message.fromId === viewerId ||
							(message.fromId === undefined && message.fromRole === viewerRole);
						const name = own
							? t('drawer.you')
							: (personNameOf(message.fromId) ??
								t(`sources.${message.fromRole}`));
						return (
							<div
								key={message.id}
								className={`${styles.bubbleRow} ${own ? styles.bubbleRowOwn : ''}`}
							>
								<Avatar name={name} color='gray' radius='xl' size='sm' />
								<Paper
									withBorder
									p='sm'
									radius='md'
									className={`${styles.bubble} ${own ? styles.bubbleOwn : ''}`}
								>
									<Group justify='space-between' gap='sm' mb={2} wrap='nowrap'>
										<Text size='xs' fw={600}>
											{name}
											<Text span size='xs' c='dimmed' fw={400}>
												{' · '}
												{t(`sources.${message.fromRole}`)}
											</Text>
										</Text>
										<Text size='xs' c='dimmed'>
											{dayjs(message.createdAt).format('DD MMM · HH:mm')}
										</Text>
									</Group>
									<Text size='sm' className={styles.message}>
										{message.message}
									</Text>
								</Paper>
							</div>
						);
					})}
				</div>
			)}

			<Textarea
				placeholder={t('drawer.replyTo', { name: replyTo })}
				aria-label={t('drawer.replyTo', { name: replyTo })}
				value={draft}
				onChange={(event) => setDraft(event.currentTarget.value)}
				onKeyDown={(event) => {
					if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
						event.preventDefault();
						send();
					}
				}}
				autosize
				minRows={2}
			/>
			<Group justify='space-between' wrap='nowrap'>
				<Text size='xs' c='dimmed'>
					{t('drawer.sendHint')}
				</Text>
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
