import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

i18n
	.use(LanguageDetector)
	.use(
		resourcesToBackend(
			(lng: string, ns: string) => import(`./${lng}/${ns}.json`)
		)
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
