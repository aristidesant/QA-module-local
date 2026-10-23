import { useMasking } from '../useMasking';
import { maskSegments } from '../mask';
import { MaskedSegments } from './MaskedSegments';

interface MaskedTextProps {
	text: string;
	/** Only the call detail passes it: there a reveal shows the real data. */
	callId?: string;
}

/** Any call text, with its sensitive data masked for the current viewer. */
export function MaskedText({ text, callId }: MaskedTextProps) {
	const { settings, active, revealed } = useMasking(callId);
	if (!settings.enabled) return <>{text}</>;
	// While revealed the spans are still found, so they can be underlined.
	const segments = maskSegments(text, settings);
	return <MaskedSegments segments={segments} revealed={revealed && !active} />;
}
