import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
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
import { AppColorSchemeProvider } from '~/components/AppColorSchemeProvider';

import App from './App';
import '~/locales/i18n';
import SuspenseFallback from './components/SuspenseFallback';

const queryClient = new QueryClient({});

applySiteMetadata();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<AppColorSchemeProvider>
				<ModalsProvider>
					<Suspense fallback={<SuspenseFallback />}>
						<App />
					</Suspense>
					<Notifications position='top-right' autoClose={4000} />
				</ModalsProvider>
			</AppColorSchemeProvider>
		</QueryClientProvider>
	</React.StrictMode>
);
