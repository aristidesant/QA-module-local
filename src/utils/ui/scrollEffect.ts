/**
 * Setup scroll effect for the UI
 * This adds a data-scroll attribute to the HTML element with the current scroll position
 * Used for enabling scroll-based CSS effects
 */
export function setupScrollEffect(): void {
	if (typeof window === 'undefined') return;

	let lastKnownScrollPosition = 0;
	let ticking = false;

	function updateScrollAttribute(scrollPos: number) {
		document.documentElement.setAttribute('data-scroll', scrollPos.toString());
	}

	// Set initial state
	updateScrollAttribute(window.scrollY);

	document.addEventListener('scroll', () => {
		lastKnownScrollPosition = window.scrollY;

		if (!ticking) {
			window.requestAnimationFrame(() => {
				updateScrollAttribute(lastKnownScrollPosition);
				ticking = false;
			});

			ticking = true;
		}
	});
}
