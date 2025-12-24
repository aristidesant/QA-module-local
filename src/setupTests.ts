import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import * as React from 'react';
import '~/locales/i18n';

// Polyfill React.act for React 19 compatibility with @testing-library/react
// React 19 removed act from react-dom/test-utils, but testing-library still expects it
if (typeof (React as any).act === 'undefined') {
	(React as any).act = (callback: () => void | Promise<void>) => {
		const result = callback();
		if (result && typeof (result as Promise<void>).then === 'function') {
			return result;
		}
		return Promise.resolve();
	};
}

// Import cleanup after React.act polyfill is in place
const { cleanup } = await import('@testing-library/react');

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
	cleanup();
});

Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(), // deprecated
		removeListener: vi.fn(), // deprecated
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

// Mock ResizeObserver for Mantine components in test environment
Object.defineProperty(globalThis, 'ResizeObserver', {
	writable: true,
	value: class {
		observe() {}
		unobserve() {}
		disconnect() {}
	},
});

// Mock scrollIntoView for Mantine Combobox components in test environment
// jsdom doesn't implement scrollIntoView, which Mantine's Combobox uses
Element.prototype.scrollIntoView = vi.fn();

// Mock react-i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: {
			changeLanguage: vi.fn(),
			language: 'en',
		},
	}),
	initReactI18next: {
		type: '3rdParty',
		init: vi.fn(),
	},
	Trans: ({ children }: { children: React.ReactNode }) => children,
	I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}));
