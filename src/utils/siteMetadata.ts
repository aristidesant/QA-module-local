const APP_TITLE =
	'Unified CXM Platform | Newtech — AI Voice Agents, Campaigns & Analytics';
const APP_DESCRIPTION =
	'Newtech Unified CXM: launch AI voice agents, manage campaigns, and analyze customer conversations in one platform. Build, deploy, and optimize end-to-end customer experiences.';
const APP_APPLICATION_NAME = 'Newtech Unified CXM';
const APP_SITE_NAME = 'Newtech';
const APP_SOCIAL_TITLE = 'Newtech - Unified CXM';
const APP_SOCIAL_DESCRIPTION =
	'Unified CXM platform by Newtech: AI agents, voice, campaigns, and customer conversations in one place.';
const APP_OG_IMAGE_PATH = '/images/og-cover.png';
const APP_LOGO_PATH = '/images/logo.png';

const updateMeta = (
	selector: string,
	attributeName: 'name' | 'property',
	attributeValue: string,
	content: string
) => {
	let element = document.head.querySelector<HTMLMetaElement>(selector);

	if (!element) {
		element = document.createElement('meta');
		element.setAttribute(attributeName, attributeValue);
		document.head.appendChild(element);
	}

	element.setAttribute('content', content);
};

const updateLink = (rel: string, href: string) => {
	let element = document.head.querySelector<HTMLLinkElement>(
		`link[rel="${rel}"]`
	);

	if (!element) {
		element = document.createElement('link');
		element.setAttribute('rel', rel);
		document.head.appendChild(element);
	}

	element.setAttribute('href', href);
};

export const applySiteMetadata = () => {
	if (typeof document === 'undefined' || typeof window === 'undefined') {
		return;
	}

	const { origin, href } = window.location;
	const canonicalUrl = href;
	const ogImageUrl = `${origin}${APP_OG_IMAGE_PATH}`;
	const logoUrl = `${origin}${APP_LOGO_PATH}`;

	document.title = APP_TITLE;

	updateLink('canonical', canonicalUrl);

	updateMeta(
		'meta[name="description"]',
		'name',
		'description',
		APP_DESCRIPTION
	);
	updateMeta(
		'meta[name="application-name"]',
		'name',
		'application-name',
		APP_APPLICATION_NAME
	);
	updateMeta('meta[name="robots"]', 'name', 'robots', 'index, follow');
	updateMeta('meta[name="theme-color"]', 'name', 'theme-color', '#ffffff');

	updateMeta(
		'meta[property="og:title"]',
		'property',
		'og:title',
		APP_SOCIAL_TITLE
	);
	updateMeta(
		'meta[property="og:description"]',
		'property',
		'og:description',
		APP_SOCIAL_DESCRIPTION
	);
	updateMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
	updateMeta(
		'meta[property="og:site_name"]',
		'property',
		'og:site_name',
		APP_SITE_NAME
	);
	updateMeta('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
	updateMeta(
		'meta[property="og:image:secure_url"]',
		'property',
		'og:image:secure_url',
		ogImageUrl
	);
	updateMeta('meta[property="og:image"]', 'property', 'og:image', ogImageUrl);
	updateMeta(
		'meta[property="og:image:alt"]',
		'property',
		'og:image:alt',
		'Newtech logo'
	);

	updateMeta(
		'meta[name="twitter:card"]',
		'name',
		'twitter:card',
		'summary_large_image'
	);
	updateMeta(
		'meta[name="twitter:title"]',
		'name',
		'twitter:title',
		APP_SOCIAL_TITLE
	);
	updateMeta(
		'meta[name="twitter:description"]',
		'name',
		'twitter:description',
		APP_SOCIAL_DESCRIPTION
	);
	updateMeta('meta[name="twitter:image"]', 'name', 'twitter:image', logoUrl);
	updateMeta('meta[name="twitter:site"]', 'name', 'twitter:site', '@newtech');
	updateMeta(
		'meta[name="twitter:creator"]',
		'name',
		'twitter:creator',
		'@newtech'
	);
};
