import { MantineProvider } from '@mantine/core';
import React, { useEffect } from 'react';
import { useColorSchemeStore } from '~/stores/colorSchemeStore';
import { theme } from '~/theme';
import { useMantineColorScheme } from '@mantine/core';

type AppColorSchemeProviderProps = {
	children: React.ReactNode;
};

const ColorSchemeSync: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const preference = useColorSchemeStore((s) => s.preference);
	const { setColorScheme } = useMantineColorScheme();

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
