import { useEffect, useState } from 'react';

/**
 * Defers chart rendering by one animation frame so recharts measures a
 * settled layout instead of a mid-mount container (which yields 0-size or
 * mis-sized charts inside CSS grid cells).
 */
export const useChartReady = () => {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const frame = requestAnimationFrame(() => setReady(true));
		// rAF is suspended in throttled/background tabs; the timer guarantees
		// charts still render there.
		const timer = window.setTimeout(() => setReady(true), 300);

		return () => {
			cancelAnimationFrame(frame);
			window.clearTimeout(timer);
		};
	}, []);

	return ready;
};
