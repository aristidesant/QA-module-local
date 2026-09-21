import React from 'react';
import { UnstyledButton } from '@mantine/core';
import styles from '../Dashboard.module.css';

interface DrillRowProps {
	onClick?: () => void;
	hint: string;
	children: React.ReactNode;
}

/** Wraps a Performance Score breakdown row: a button when it can drill down, a plain box otherwise. */
export const DrillRow: React.FC<DrillRowProps> = ({
	onClick,
	hint,
	children,
}) =>
	onClick ? (
		<UnstyledButton
			className={styles.drillRow}
			onClick={onClick}
			aria-label={hint}
			title={hint}
		>
			{children}
		</UnstyledButton>
	) : (
		<div className={styles.drillRowStatic}>{children}</div>
	);

export default DrillRow;
