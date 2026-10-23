import type { CSSProperties, ReactNode } from 'react';
import styles from './Insights.module.css';

interface InsightsTileProps {
	title: string;
	subtitle?: string;
	/** Columns out of 12 on a wide screen. */
	span: number;
	/** Position in the grid, for the staggered entrance. */
	index: number;
	/** Always take the full row on tablet widths. */
	wide?: boolean;
	hero?: boolean;
	/** Drawn behind the whole tile, for example the particle field of the hero band. */
	backdrop?: ReactNode;
	actions?: ReactNode;
	children: ReactNode;
}

/** One tile of the Insights grid: a hairline card with a small uppercase title. */
export function InsightsTile({
	title,
	subtitle,
	span,
	index,
	wide = false,
	hero = false,
	backdrop,
	actions,
	children,
}: InsightsTileProps) {
	const className = [
		styles.tile,
		wide ? styles.wide : '',
		hero ? styles.hero : '',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<section
			className={className}
			aria-label={title}
			// inline-style-allow: the grid placement and entrance order of each tile are runtime values
			style={{ '--span': span, '--i': index } as CSSProperties}
		>
			{backdrop}
			<div className={styles.tileHeader}>
				<div>
					<div className={styles.tileTitle}>{title}</div>
					{subtitle && <div className={styles.tileSubtitle}>{subtitle}</div>}
				</div>
				{actions}
			</div>
			<div className={styles.tileBody}>{children}</div>
		</section>
	);
}

export default InsightsTile;
