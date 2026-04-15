import { useEffect } from 'react';
import { setupScrollEffect } from '../utils/ui/scrollEffect';

/**
 * A hook that sets up the scroll effect for UI components
 * This adds a data-scroll attribute to the HTML element
 */
export function useScrollEffect(): void {
	useEffect(() => {
		setupScrollEffect();
	}, []);
}
