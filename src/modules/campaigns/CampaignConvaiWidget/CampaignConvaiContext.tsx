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
	VoiceOption,
} from './CampaignConvaiWidget.types';
import type { AgentTestPrimitive } from '~/models/AgentTestModel';

type DynamicVariableValue = AgentTestPrimitive;
type DynamicVariablesMap = Record<string, DynamicVariableValue>;
const VOICE_CONTROLLED_VARIABLE = 'agentName';

const removeVoiceControlledVariable = (
	variables: DynamicVariablesMap
): DynamicVariablesMap => {
	const editableVariables = { ...variables };
	delete editableVariables[VOICE_CONTROLLED_VARIABLE];
	return editableVariables;
};

const getBrowserStorage = () => {
	if (typeof window === 'undefined') {
		return null;
	}

	try {
		return window.localStorage;
	} catch {
		return null;
	}
};

const isPrimitiveValue = (value: unknown): value is DynamicVariableValue => {
	return (
		typeof value === 'string' ||
		typeof value === 'number' ||
		typeof value === 'boolean'
	);
};

const normalizeDynamicVariableValue = (
	value: unknown
): DynamicVariableValue | null => {
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (trimmed === 'true') return true;
		if (trimmed === 'false') return false;
		if (trimmed !== '' && !Number.isNaN(Number(trimmed))) {
			return Number(trimmed);
		}
		return value;
	}

	if (isPrimitiveValue(value)) {
		return value;
	}

	return null;
};

const serializeDynamicVariables = (variables: DynamicVariablesMap) => {
	return JSON.stringify(removeVoiceControlledVariable(variables));
};

const parseDynamicVariables = (raw: string | null) => {
	if (!raw) return null;

	try {
		const parsed = JSON.parse(raw) as Record<string, unknown>;
		const entries = Object.entries(parsed).reduce<DynamicVariablesMap>(
			(acc, [key, value]) => {
				const normalized = normalizeDynamicVariableValue(value);
				if (normalized !== null) {
					acc[key] = normalized;
				}
				return acc;
			},
			{}
		);

		return removeVoiceControlledVariable(entries);
	} catch {
		return null;
	}
};

const getAgentDynamicVariableDefaults = (
	config: unknown
): DynamicVariablesMap => {
	const placeholders =
		(
			config as
				| {
						conversationConfig?: {
							agent?: {
								dynamicVariables?: {
									dynamicVariablePlaceholders?: Record<string, unknown>;
								};
							};
						};
				  }
				| null
				| undefined
		)?.conversationConfig?.agent?.dynamicVariables
			?.dynamicVariablePlaceholders ?? {};

	return Object.entries(placeholders).reduce<DynamicVariablesMap>(
		(acc, [key, value]) => {
			if (key === VOICE_CONTROLLED_VARIABLE) return acc;

			const normalized = normalizeDynamicVariableValue(value);
			if (normalized !== null) {
				acc[key] = normalized;
			} else if (value !== null && value !== undefined) {
				acc[key] = String(value);
			}
			return acc;
		},
		{}
	);
};

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
	voices: VoiceOption[];
	selectedVoiceId: string | null;
	setSelectedVoiceId: (id: string | null) => void;
	dynamicVariables: DynamicVariablesMap;
	setDynamicVariables: (value: DynamicVariablesMap) => void;
	resetDynamicVariables: () => void;
	dynamicVariablesDefaults: DynamicVariablesMap;
}

type ConversationControls = {
	startSession: (options: {
		signedUrl: string;
		connectionType?: 'websocket';
		overrides?: {
			tts?: { voiceId?: string };
		};
		dynamicVariables?: Record<string, string | number | boolean>;
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
	voices: VoiceOption[];
	agentConfig?: unknown;
	storageKey: string;
	children: ReactNode;
}

const ConvaiStateProvider = ({
	agentId,
	voices,
	agentConfig,
	storageKey,
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
	const [selectedVoiceId, setSelectedVoiceId] = useState<string | null>(
		() => voices[0]?.voiceId ?? null
	);
	const dynamicVariablesDefaults = useMemo(
		() => getAgentDynamicVariableDefaults(agentConfig),
		[agentConfig]
	);
	const [dynamicVariables, setDynamicVariables] = useState<DynamicVariablesMap>(
		() => dynamicVariablesDefaults
	);
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

	const resetDynamicVariables = useCallback(() => {
		setDynamicVariables(dynamicVariablesDefaults);
		const storage = getBrowserStorage();
		if (storage) {
			storage.removeItem(storageKey);
		}
	}, [dynamicVariablesDefaults, storageKey]);

	useEffect(() => {
		setDynamicVariables((current) => {
			const storage = getBrowserStorage();
			const storedVariables = parseDynamicVariables(
				storage?.getItem(storageKey) ?? null
			);

			if (storedVariables) {
				return storedVariables;
			}

			return Object.keys(current).length > 0
				? current
				: dynamicVariablesDefaults;
		});
	}, [dynamicVariablesDefaults, storageKey]);

	useEffect(() => {
		const storage = getBrowserStorage();
		if (!storage) return;

		if (
			Object.keys(dynamicVariables).length === 0 &&
			Object.keys(dynamicVariablesDefaults).length === 0
		) {
			storage.removeItem(storageKey);
			return;
		}

		storage.setItem(storageKey, serializeDynamicVariables(dynamicVariables));
	}, [dynamicVariables, dynamicVariablesDefaults, storageKey]);

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
				const selectedVoice =
					voices.find((voice) => voice.voiceId === selectedVoiceId) ??
					voices[0];
				if (nextSignedUrl) {
					await conversationControlsRef.current.startSession({
						signedUrl: nextSignedUrl,
						connectionType: 'websocket',
						...(selectedVoice && {
							overrides: { tts: { voiceId: selectedVoice.voiceId } },
						}),
						dynamicVariables: {
							...dynamicVariablesDefaults,
							...removeVoiceControlledVariable(dynamicVariables),
							agentName: selectedVoice?.voiceName ?? '',
						},
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
		fetchAgentSignedUrl,
		requestMicrophoneAccess,
		resetConversationState,
		dynamicVariables,
		dynamicVariablesDefaults,
		storageKey,
		selectedVoiceId,
		voices,
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
			voices,
			selectedVoiceId,
			setSelectedVoiceId,
			dynamicVariables,
			setDynamicVariables,
			resetDynamicVariables,
			dynamicVariablesDefaults,
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
			voices,
			selectedVoiceId,
			setSelectedVoiceId,
			dynamicVariables,
			resetDynamicVariables,
			dynamicVariablesDefaults,
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
	voices: VoiceOption[];
	agentConfig?: unknown;
	storageKey: string;
	children: ReactNode;
}

export const CampaignConvaiProvider = ({
	agentId,
	voices,
	agentConfig,
	storageKey,
	children,
}: CampaignConvaiProviderProps) => {
	return (
		<ConvaiStateProvider
			agentId={agentId}
			voices={voices}
			agentConfig={agentConfig}
			storageKey={storageKey}
		>
			{children}
		</ConvaiStateProvider>
	);
};
