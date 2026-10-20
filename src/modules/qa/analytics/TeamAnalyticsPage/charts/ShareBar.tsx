import { Box, Text, Tooltip } from '@mantine/core';
import classes from './charts.module.css';

export interface ShareSegment {
	key: string;
	label: string;
	value: number;
	color: string;
}

interface ShareBarProps {
	segments: ShareSegment[];
	/** Shown before the bar. */
	title?: string;
}

/** A 100% bar with a 2px gap between segments, a tooltip per segment and a legend underneath. */
export default function ShareBar({ segments, title }: ShareBarProps) {
	const total = segments.reduce((s, seg) => s + seg.value, 0);
	const share = (value: number) =>
		total ? Math.round((value / total) * 100) : 0;
	const visible = segments.filter((s) => s.value > 0);

	return (
		<div>
			{title && (
				<Text size='xs' fw={600} mb={6}>
					{title}
				</Text>
			)}
			<div className={classes.shareBar}>
				{visible.length === 0 ? (
					<Box
						h={14}
						flex={1}
						bg='var(--series-other)'
						className={classes.shareSegment}
					/>
				) : (
					visible.map((seg) => (
						<Tooltip
							key={seg.key}
							label={`${seg.label} · ${seg.value.toLocaleString()} (${share(seg.value)}%)`}
							withArrow
						>
							<Box
								h={14}
								flex={seg.value}
								bg={seg.color}
								className={classes.shareSegment}
							/>
						</Tooltip>
					))
				)}
			</div>
			<div className={classes.legendRow}>
				{segments.map((seg) => (
					<span key={seg.key} className={classes.legendItem}>
						<Box w={10} h={10} bg={seg.color} className={classes.swatch} />
						<Text span size='xs'>
							{seg.label}
						</Text>
						<Text span size='xs' c='dimmed'>
							{seg.value.toLocaleString()} · {share(seg.value)}%
						</Text>
					</span>
				))}
			</div>
		</div>
	);
}
