import { useMemo } from 'react';
import styles from './MiniSparkline.module.css';

interface MiniSparklineProps {
	data: number[];
	color?: string;
	height?: number;
}

export const MiniSparkline = ({
	data,
	color = 'var(--mantine-color-blue-6)',
	height = 40,
}: MiniSparklineProps) => {
	const points = useMemo(() => {
		if (data.length === 0) return '';

		const max = Math.max(...data);
		const min = Math.min(...data);
		const range = max - min || 1;
		const width = 80;
		const step = width / (data.length - 1 || 1);

		return data
			.map((value, index) => {
				const x = index * step;
				const y = height - ((value - min) / range) * height;
				return `${x},${y}`;
			})
			.join(' ');
	}, [data, height]);

	if (data.length === 0) return null;

	return (
		<svg
			className={styles.sparkline}
			width='80'
			height={height}
			viewBox={`0 0 80 ${height}`}
			preserveAspectRatio='none'
		>
			<polyline
				fill='none'
				stroke={color}
				strokeWidth='2'
				points={points}
				vectorEffect='non-scaling-stroke'
			/>
		</svg>
	);
};

export default MiniSparkline;
