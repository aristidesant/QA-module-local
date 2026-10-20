import type { ReactNode } from 'react';
import classes from './charts.module.css';

/** Two cards side by side on wide screens, stacked below. */
export default function Pair({ children }: { children: ReactNode }) {
	return <div className={classes.pair}>{children}</div>;
}
