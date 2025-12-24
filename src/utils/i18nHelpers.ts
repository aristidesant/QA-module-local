import i18n from '~/locales/i18n';

/**
 * Prefetches a translation namespace.
 * Useful for onMouseEnter events on navigation links.
 */
export const prefetchNamespace = (ns: string) => {
	if (ns && !i18n.hasLoadedNamespace(ns)) {
		i18n.loadNamespaces([ns]);
	}
};
