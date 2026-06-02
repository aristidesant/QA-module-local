import {
	createContext,
	useRef,
	useContext,
	useMemo,
	useState,
	useCallback,
	useEffect,
	type MutableRefObject,
	type ReactNode,
} from 'react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { useTranslation } from 'react-i18next';
import { useGetAgentSignedUrl } from '~/queries/agentQueries';
import type {
	ConvaiMode,
	ConvaiStatus,
	TranscriptItem,
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

type ConversationControls = {
	startSession: (options: {
		signedUrl: string;
		connectionType?: 'websocket';
	}) => void;
	endSession: () => void;
	sendUserMessage: (message: string) => void;
	setMuted: (value: boolean) => void;
};

type ConversationSnapshot = {
	status: ConvaiStatus;
	mode: ConvaiMode;
	message: string | undefined;
	isSpeaking: boolean;
	isListening: boolean;
	isMuted: boolean;
};

const DEFAULT_CONVERSATION_SNAPSHOT: ConversationSnapshot = {
	status: 'disconnected',
	mode: 'listening',
	message: undefined,
	isSpeaking: false,
	isListening: false,
	isMuted: false,
};

const areConversationSnapshotsEqual = (
	current: ConversationSnapshot,
	next: ConversationSnapshot
) => {
	return (
		current.status === next.status &&
		current.mode === next.mode &&
		current.message === next.message &&
		current.isSpeaking === next.isSpeaking &&
		current.isListening === next.isListening &&
		current.isMuted === next.isMuted
	);
};

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

interface ConversationBridgeProps {
	onControlsReady: (controls: ConversationControls) => void;
	onSnapshotChange: (snapshot: ConversationSnapshot) => void;
	onConnect: (conversationId: string) => void;
	onDisconnect: () => void;
	onError: () => void;
	pendingUserMessageRef: MutableRefObject<string | null>;
	appendTranscriptMessage: (
		role: TranscriptItem['role'],
		message: string,
		key: string
	) => void;
}

const ConversationBridge = ({
	onControlsReady,
	onSnapshotChange,
	onConnect,
	onDisconnect,
	onError,
	pendingUserMessageRef,
	appendTranscriptMessage,
}: ConversationBridgeProps) => {
	const hasRegisteredControlsRef = useRef(false);
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
		onConnect: ({ conversationId }) => {
			onConnect(conversationId);
			pendingUserMessageRef.current = null;
		},
		onDisconnect: () => {
			onDisconnect();
		},
		onError: () => {
			onError();
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

			appendTranscriptMessage(
				role,
				transcriptMessage,
				`${role}-${event_id ?? transcriptMessage.trim()}`
			);
		},
	});

	useEffect(() => {
		if (hasRegisteredControlsRef.current) return;
		hasRegisteredControlsRef.current = true;

		onControlsReady({
			startSession,
			endSession,
			sendUserMessage,
			setMuted,
		});
	}, [endSession, onControlsReady, sendUserMessage, setMuted, startSession]);

	useEffect(() => {
		onSnapshotChange({
			status,
			message,
			mode,
			isSpeaking,
			isListening,
			isMuted,
		});
	}, [
		isListening,
		isMuted,
		isSpeaking,
		message,
		mode,
		onSnapshotChange,
		status,
	]);

	return null;
};

interface ConvaiStateProviderProps {
	agentId: string;
	children: ReactNode;
}

const ConvaiStateProvider = ({
	agentId,
	children,
}: ConvaiStateProviderProps) => {
	const { t } = useTranslation('campaign.detail.test');
	const fetchAgentSignedUrl = useGetAgentSignedUrl();
	const [conversationId, setConversationId] = useState<string | null>(null);
	const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
	const [draftMessage, setDraftMessage] = useState('');
	const [localErrorMessage, setLocalErrorMessage] = useState<string>();
	const [conversationSnapshot, setConversationSnapshot] =
		useState<ConversationSnapshot>(DEFAULT_CONVERSATION_SNAPSHOT);
	const pendingUserMessageRef = useRef<string | null>(null);
	const pendingStartRef = useRef(false);
	const pendingSignedUrlRef = useRef<string | null>(null);
	const conversationControlsRef = useRef<ConversationControls | null>(null);

	const appendTranscriptMessage = useCallback(
		(role: TranscriptItem['role'], message: string, key: string) => {
			setTranscript((current) => {
				if (current.some((item) => item.id === key)) {
					return current;
				}

				return [...current, { id: key, role, message, timestamp: Date.now() }];
			});
		},
		[]
	);

	const resetConversationState = useCallback(() => {
		setConversationId(null);
		setDraftMessage('');
		setLocalErrorMessage(undefined);
		setConversationSnapshot(DEFAULT_CONVERSATION_SNAPSHOT);
		pendingUserMessageRef.current = null;
	}, []);

	const requestMicrophoneAccess = useCallback(async () => {
		if (
			typeof navigator === 'undefined' ||
			!navigator.mediaDevices?.getUserMedia
		) {
			throw new Error(t('widget.error.microphoneUnavailable'));
		}

		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		stream.getTracks().forEach((track) => track.stop());
	}, [t]);

	const handleStartSession = useCallback(async () => {
		try {
			if (pendingStartRef.current) {
				return;
			}

			setTranscript([]);
			resetConversationState();
			pendingStartRef.current = true;
			await requestMicrophoneAccess();

			const signedUrl = await fetchAgentSignedUrl.mutateAsync(agentId);
			pendingSignedUrlRef.current = signedUrl;

			if (conversationControlsRef.current) {
				pendingStartRef.current = false;
				const nextSignedUrl = pendingSignedUrlRef.current;
				pendingSignedUrlRef.current = null;
				if (nextSignedUrl) {
					await conversationControlsRef.current.startSession({
						signedUrl: nextSignedUrl,
						connectionType: 'websocket',
					});
				}
			}
		} catch (error) {
			pendingStartRef.current = false;
			pendingSignedUrlRef.current = null;

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
	}, [
		agentId,
		fetchAgentSignedUrl,
		requestMicrophoneAccess,
		resetConversationState,
		t,
	]);

	const handleEndSession = useCallback(() => {
		pendingStartRef.current = false;
		pendingSignedUrlRef.current = null;
		conversationControlsRef.current?.endSession();
	}, []);

	const handleToggleMute = useCallback(() => {
		const currentMuted = conversationSnapshot.isMuted;
		conversationControlsRef.current?.setMuted(!currentMuted);
	}, [conversationSnapshot.isMuted]);

	const handleSendMessage = useCallback(() => {
		const trimmed = draftMessage.trim();
		if (!trimmed) return;

		pendingUserMessageRef.current = trimmed;
		appendTranscriptMessage('user', trimmed, `user-local-${Date.now()}`);
		conversationControlsRef.current?.sendUserMessage(trimmed);
		setDraftMessage('');
	}, [appendTranscriptMessage, draftMessage]);

	const handleControlsReady = useCallback((controls: ConversationControls) => {
		conversationControlsRef.current = controls;

		if (!pendingStartRef.current || !pendingSignedUrlRef.current) {
			return;
		}

		pendingStartRef.current = false;
		const signedUrl = pendingSignedUrlRef.current;
		pendingSignedUrlRef.current = null;

		if (!signedUrl) {
			return;
		}

		void controls.startSession({
			signedUrl,
			connectionType: 'websocket',
		});
	}, []);

	const handleSnapshotChange = useCallback((snapshot: ConversationSnapshot) => {
		setConversationSnapshot((current) =>
			areConversationSnapshotsEqual(current, snapshot) ? current : snapshot
		);
	}, []);

	const value = useMemo<CampaignConvaiContextValue>(
		() => ({
			status: localErrorMessage ? 'error' : conversationSnapshot.status,
			mode: conversationSnapshot.mode,
			message: localErrorMessage ?? conversationSnapshot.message,
			isSpeaking: conversationSnapshot.isSpeaking,
			isListening: conversationSnapshot.isListening,
			isMuted: conversationSnapshot.isMuted,
			sessionId:
				!localErrorMessage &&
				conversationId &&
				conversationSnapshot.status === 'connected'
					? conversationId
					: '',
			transcript,
			draftMessage,
			setDraftMessage,
			startSession: handleStartSession,
			endSession: handleEndSession,
			toggleMute: handleToggleMute,
			sendMessage: handleSendMessage,
		}),
		[
			conversationId,
			conversationSnapshot.isListening,
			conversationSnapshot.isMuted,
			conversationSnapshot.isSpeaking,
			conversationSnapshot.message,
			conversationSnapshot.mode,
			conversationSnapshot.status,
			draftMessage,
			handleEndSession,
			handleSendMessage,
			handleStartSession,
			handleToggleMute,
			localErrorMessage,
			transcript,
		]
	);

	return (
		<CampaignConvaiContext.Provider value={value}>
			<ConversationProvider>
				<ConversationBridge
					onControlsReady={handleControlsReady}
					onSnapshotChange={handleSnapshotChange}
					onConnect={setConversationId}
					onDisconnect={resetConversationState}
					onError={() => {
						resetConversationState();
						conversationControlsRef.current?.endSession();
					}}
					pendingUserMessageRef={pendingUserMessageRef}
					appendTranscriptMessage={appendTranscriptMessage}
				/>
			</ConversationProvider>
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
		<ConvaiStateProvider agentId={agentId}>{children}</ConvaiStateProvider>
	);
};
