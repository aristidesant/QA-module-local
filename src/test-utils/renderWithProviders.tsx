import { render } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
		},
	},
});

export const renderWithProviders = (children: ReactNode) => {
	return render(
		<QueryClientProvider client={queryClient}>
			<MantineProvider>{children}</MantineProvider>
		</QueryClientProvider>
	);
};

export default renderWithProviders;
