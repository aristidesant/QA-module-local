import { IconTrendingUp } from '@tabler/icons-react';
import classes from './StatsCard.module.css';

export default function StatsCard() {
	return (
		<div className={classes.card}>
			<div className={classes.header}>
				<div className={classes.label}>Statistics</div>
				<div className={classes.title}>Total calls</div>
			</div>

			<div className={classes.content}>
				<div className={classes.number}>424,456</div>
				<div className={classes.change}>
					<IconTrendingUp size={16} color='#51cf66' />
					<span className={classes.changeText}>+21.01%</span>
				</div>
			</div>

			<div className={classes.chart}>
				<svg width='100%' height='40' viewBox='0 0 120 40'>
					<defs>
						<linearGradient id='gradient' x1='0%' y1='0%' x2='0%' y2='100%'>
							<stop offset='0%' stopColor='#339af0' stopOpacity='0.3' />
							<stop offset='100%' stopColor='#339af0' stopOpacity='0.05' />
						</linearGradient>
					</defs>
					<path
						d='M5 35 L15 30 L25 25 L35 20 L45 15 L55 18 L65 12 L75 8 L85 5 L95 3 L105 2 L115 1 L115 40 L5 40 Z'
						fill='url(#gradient)'
					/>
					<path
						d='M5 35 L15 30 L25 25 L35 20 L45 15 L55 18 L65 12 L75 8 L85 5 L95 3 L105 2 L115 1'
						stroke='#339af0'
						strokeWidth='2'
						fill='none'
						opacity='0.8'
					/>
				</svg>
			</div>
		</div>
	);
}
