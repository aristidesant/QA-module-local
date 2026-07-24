import {
	MantineProvider,
	type MantineColorScheme,
	type MantineColorSchemeManager,
} from '@mantine/core';
import React from 'react';
import { useColorSchemeStore } from '~/stores/colorSchemeStore';
import { theme } from '~/theme';

type AppColorSchemeProviderProps = {
	children: React.ReactNode;
};

/**
 * Single source of truth for the color scheme.
 *
 * Previously Mantine's default localStorage manager (key `mantine-color-scheme-value`)
 * fought the app's zustand store (key `color-scheme`) plus a manual attribute writer,
 * so `data-mantine-color-scheme` flickered between light/dark on every switch.
 *
 * This manager makes Mantine read/write the SAME zustand preference, so there is a
 * single writer of the attribute and a single persisted value.
 */
const createStoreColorSchemeManager = (): MantineColorSchemeManager => {
	let unsubscribe: (() => void) | undefined;

	return {
		get: (defaultValue) =>
			(useColorSchemeStore.getState().preference ??
				defaultValue) as MantineColorScheme,
		set: (value) => {
			// Mantine only ever emits 'light' | 'dark' | 'auto', which matches the store.
			useColorSchemeStore
				.getState()
				.setPreference(value as 'light' | 'dark' | 'auto');
		},
		subscribe: (onUpdate) => {
			unsubscribe = useColorSchemeStore.subscribe((state, prev) => {
				if (state.preference !== prev.preference) {
					onUpdate(state.preference as MantineColorScheme);
				}
			});
		},
		unsubscribe: () => {
			unsubscribe?.();
			unsubscribe = undefined;
		},
		clear: () => {
			useColorSchemeStore.getState().setPreference('auto');
		},
	};
};

const colorSchemeManager = createStoreColorSchemeManager();

export const AppColorSchemeProvider: React.FC<AppColorSchemeProviderProps> = ({
	children,
}) => (
	<MantineProvider
		theme={theme}
		defaultColorScheme='auto'
		colorSchemeManager={colorSchemeManager}
	>
		{children}
	</MantineProvider>
);
