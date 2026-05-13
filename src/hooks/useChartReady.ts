import { useEffect, useState } from 'react';

export const useChartReady = () => {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const raf = requestAnimationFrame(() => setReady(true));
		return () => cancelAnimationFrame(raf);
	}, []);

	return ready;
};
