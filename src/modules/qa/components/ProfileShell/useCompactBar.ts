import { useEffect, useRef, useState } from 'react';

/** Returns a ref for the full header and whether the compact bar should show (header scrolled out). */
export function useCompactBar(resetKey: string | undefined) {
	const headerRef = useRef<HTMLDivElement>(null);
	const [headerVisible, setHeaderVisible] = useState(true);
	useEffect(() => {
		const el = headerRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => setHeaderVisible(entry.isIntersecting),
			{ threshold: 0 }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [resetKey]);
	return { headerRef, compact: !headerVisible };
}
