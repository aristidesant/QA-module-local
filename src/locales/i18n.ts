import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

// Vite-resolved map of every locale bundle (e.g. './en/qa.agents.json').
//
// We deliberately use `import.meta.glob` instead of a bare dynamic-import
// template (`import(`./${lng}/${ns}.json`)`): the template form lets Vite bake a
// stale file list into a long-running dev server, so namespaces added to the
// branch after the server started fail to load and render as raw keys. The glob
// is re-evaluated via HMR when locale files are added/removed, so new namespaces
// resolve correctly without a server restart.
const localeModules = import.meta.glob<{
	default: Record<string, unknown>;
}>('./*/*.json');

i18n
	.use(LanguageDetector)
	.use(
		resourcesToBackend((lng: string, ns: string) => {
			const loader = localeModules[`./${lng}/${ns}.json`];
			if (!loader) {
				// No bundle for this language (e.g. a detected browser locale we
				// don't ship) — reject so i18next falls back to `fallbackLng`.
				return Promise.reject(new Error(`Missing locale bundle: ${lng}/${ns}`));
			}
			return loader();
		})
	)
	.use(initReactI18next)
	.init({
		fallbackLng: 'en',
		defaultNS: 'common',
		ns: ['common'],
		interpolation: {
			escapeValue: false,
		},
		detection: {
			order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
			caches: ['localStorage', 'cookie'],
		},
		react: {
			useSuspense: true,
		},
	});

export default i18n;
