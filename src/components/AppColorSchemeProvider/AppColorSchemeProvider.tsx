import { MantineProvider } from '@mantine/core';
import React, { useEffect, useLayoutEffect } from 'react';
import { useColorSchemeStore } from '~/stores/colorSchemeStore';
import { theme } from '~/theme';
import { useMantineColorScheme } from '@mantine/core';

type AppColorSchemeProviderProps = {
	children: React.ReactNode;
};

const resolveScheme = (
	preference: 'light' | 'dark' | 'auto'
): 'light' | 'dark' => {
	if (preference !== 'auto') return preference;
	return window.matchMedia?.('(prefers-color-scheme: dark)').matches
		? 'dark'
		: 'light';
};

const ColorSchemeSync: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const preference = useColorSchemeStore((s) => s.preference);
	const { setColorScheme } = useMantineColorScheme();

	// Update DOM attribute before paint to prevent visual flash.
	// Mantine's own effect fires after paint, so we set it synchronously here.
	useLayoutEffect(() => {
		document.documentElement.setAttribute(
			'data-mantine-color-scheme',
			resolveScheme(preference)
		);
	}, [preference]);

	// Keep Mantine's internal context in sync (for components reading useMantineColorScheme).
	useEffect(() => {
		setColorScheme(preference);
	}, [preference, setColorScheme]);

	return <>{children}</>;
};

export const AppColorSchemeProvider: React.FC<AppColorSchemeProviderProps> = ({
	children,
}) => {
	const preference = useColorSchemeStore((s) => s.preference);

	return (
		<MantineProvider theme={theme} defaultColorScheme={preference}>
			<ColorSchemeSync>{children}</ColorSchemeSync>
		</MantineProvider>
	);
};
