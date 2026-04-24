import { useCallback, useState } from 'react';

export function useConversationDrawer() {
	const [selectedConversationId, setSelectedConversationId] = useState<
		number | null
	>(null);
	const [drawerOpened, setDrawerOpened] = useState(false);

	const openConversation = useCallback((conversation: { id: number }) => {
		setSelectedConversationId(conversation.id);
		setDrawerOpened(true);
	}, []);

	const closeDrawer = useCallback(() => {
		setDrawerOpened(false);
	}, []);

	return {
		selectedConversationId,
		drawerOpened,
		openConversation,
		closeDrawer,
	};
}

export default useConversationDrawer;
