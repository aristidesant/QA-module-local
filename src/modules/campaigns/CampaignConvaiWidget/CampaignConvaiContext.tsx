import {
	createContext,
	useRef,
	useContext,
	useMemo,
	useState,
	type ReactNode,
} from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { useTranslation } from 'react-i18next';
import {
	type ConvaiMode,
	type ConvaiStatus,
	type TranscriptItem,
} from './CampaignConvaiWidget.types';

interface CampaignConvaiContextValue {
	status: ConvaiStatus;
	mode: ConvaiMode;
	message: string | undefined;
	isSpeaking: boolean;
	isListening: boolean;
	isMuted: boolean;
	sessionId: string;
	transcript: TranscriptItem[];
	draftMessage: string;
	setDraftMessage: (value: string) => void;
	startSession: () => void;
	endSession: () => void;
	toggleMute: () => void;
	sendMessage: () => void;
}

const CampaignConvaiContext = createContext<CampaignConvaiContextValue | null>(
	null
);

export const useCampaignConvai = () => {
	const ctx = useContext(CampaignConvaiContext);
	if (!ctx) {
		throw new Error(
			'useCampaignConvai must be used within a CampaignConvaiProvider'
		);
	}
	return ctx;
};

interface ConvaiStateProviderProps {
	children: ReactNode;
}

const ConvaiStateProvider = ({ children }: ConvaiStateProviderProps) => {
	const { t } = useTranslation('campaign.detail.test');
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
	const [draftMessage, setDraftMessage] = useState('');
	const [localErrorMessage, setLocalErrorMessage] = useState<string>();
	const pendingUserMessageRef = useRef<string | null>(null);

	const appendTranscriptMessage = (
		role: TranscriptItem['role'],
		message: string,
		key: string
	) => {
		setTranscript((current) => {
			if (current.some((item) => item.id === key)) {
				return current;
			}

			return [...current, { id: key, role, message }];
		});
	};

	const resetConversationState = () => {
		setConversationId(null);
		setDraftMessage('');
		setLocalErrorMessage(undefined);
		pendingUserMessageRef.current = null;
	};

	const requestMicrophoneAccess = async () => {
		if (
			typeof navigator === 'undefined' ||
			!navigator.mediaDevices?.getUserMedia
		) {
			throw new Error(t('widget.error.microphoneUnavailable'));
		}

		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		stream.getTracks().forEach((track) => track.stop());
	};

	const handleStartSession = async () => {
		try {
			setTranscript([]);
			setDraftMessage('');
			setLocalErrorMessage(undefined);
			pendingUserMessageRef.current = null;
			await requestMicrophoneAccess();
			startSession();
		} catch (error) {
			const isPermissionError =
				error instanceof DOMException &&
				(error.name === 'NotAllowedError' || error.name === 'SecurityError');

			setLocalErrorMessage(
				isPermissionError
					? t('widget.error.microphonePermission')
					: error instanceof Error
						? error.message
						: t('widget.error.microphoneUnavailable')
			);
		}
	};

	const {
		startSession,
		endSession,
		sendUserMessage,
		status,
		message,
		mode,
		isSpeaking,
		isListening,
		isMuted,
		setMuted,
	} = useConversation({
		onConnect: ({ conversationId: connectedId }) => {
			setConversationId(connectedId);
			pendingUserMessageRef.current = null;
		},
		onDisconnect: () => {
			resetConversationState();
		},
		onError: () => {
			resetConversationState();
			endSession();
		},
		onMessage: ({ message: transcriptMessage, role, event_id }) => {
			if (!transcriptMessage.trim()) return;

			if (
				role === 'user' &&
				pendingUserMessageRef.current === transcriptMessage.trim()
			) {
				pendingUserMessageRef.current = null;
				return;
			}

			const key = `${role}-${event_id ?? transcriptMessage.trim()}`;
			appendTranscriptMessage(role, transcriptMessage, key);
		},
	});

	const value = useMemo<CampaignConvaiContextValue>(
		() => ({
			status: localErrorMessage ? 'error' : status,
			mode,
			message: localErrorMessage ?? message,
			isSpeaking,
			isListening,
			isMuted,
			sessionId:
				!localErrorMessage && conversationId && status === 'connected'
					? conversationId
					: '',
			transcript,
			draftMessage,
			setDraftMessage,
			startSession: handleStartSession,
			endSession: () => endSession(),
			toggleMute: () => setMuted(!isMuted),
			sendMessage: () => {
				const trimmed = draftMessage.trim();
				if (!trimmed) return;
				pendingUserMessageRef.current = trimmed;
				appendTranscriptMessage('user', trimmed, `user-local-${Date.now()}`);
				sendUserMessage(trimmed);
				setDraftMessage('');
			},
		}),
		[
			status,
			mode,
			message,
			isSpeaking,
			isListening,
			isMuted,
			conversationId,
			localErrorMessage,
			transcript,
			draftMessage,
			handleStartSession,
			endSession,
			setMuted,
			sendUserMessage,
			appendTranscriptMessage,
		]
	);

	return (
		<CampaignConvaiContext.Provider value={value}>
			{children}
		</CampaignConvaiContext.Provider>
	);
};

interface CampaignConvaiProviderProps {
	agentId: string;
	children: ReactNode;
}

export const CampaignConvaiProvider = ({
	agentId,
	children,
}: CampaignConvaiProviderProps) => {
	return (
		<ConversationProvider agentId={agentId}>
			<ConvaiStateProvider>{children}</ConvaiStateProvider>
		</ConversationProvider>
	);
};
