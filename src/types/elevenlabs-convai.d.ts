import type { HTMLAttributes } from 'react';

declare module 'react' {
	namespace JSX {
		interface IntrinsicElements {
			'elevenlabs-convai': HTMLAttributes<HTMLElement> & {
				'agent-id'?: string;
				'signed-url'?: string;
				'server-location'?: string;
				variant?: string;
				dismissible?: boolean | string;
				'avatar-image-url'?: string;
				'avatar-orb-color-1'?: string;
				'avatar-orb-color-2'?: string;
				'action-text'?: string;
				'start-call-text'?: string;
				'end-call-text'?: string;
				'expand-text'?: string;
				'listening-text'?: string;
				'speaking-text'?: string;
				'markdown-link-allowed-hosts'?: string;
				'markdown-link-include-www'?: boolean | string;
				'markdown-link-allow-http'?: boolean | string;
				'syntax-highlight-theme'?: string;
			};
		}
	}
}

export {};
