import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '~/locales/i18n';
import SuspenseFallback from './components/SuspenseFallback';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<Suspense fallback={<SuspenseFallback message='Loading application...' />}>
			<App />
		</Suspense>
	</React.StrictMode>
);
