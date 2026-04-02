import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/charts/styles.css';
import '~/styles/global.css';
import '~/utils/axiosInterceptor';
import { applySiteMetadata } from '~/utils/siteMetadata';

import App from './App';
import '~/locales/i18n';
import SuspenseFallback from './components/SuspenseFallback';
import { theme } from './theme';

const queryClient = new QueryClient({});

applySiteMetadata();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<MantineProvider theme={theme}>
				<ModalsProvider>
					<Suspense fallback={<SuspenseFallback />}>
						<App />
					</Suspense>
					<Notifications position='top-right' autoClose={4000} />
				</ModalsProvider>
			</MantineProvider>
		</QueryClientProvider>
	</React.StrictMode>
);
