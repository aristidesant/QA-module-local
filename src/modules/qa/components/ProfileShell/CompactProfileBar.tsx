import type { ReactNode } from 'react';
import { Group } from '@mantine/core';
import styles from './CompactProfileBar.module.css';

interface CompactProfileBarProps {
	/** True once the full header has scrolled out of view. */
	visible: boolean;
	/** Avatar, name and the one number that matters. */
	children: ReactNode;
	actions: ReactNode;
}

/** A slim bar that floats over the page while the long profile scrolls. */
export function CompactProfileBar({
	visible,
	children,
	actions,
}: CompactProfileBarProps) {
	return (
		<div className={styles.anchor}>
			<div
				className={styles.bar}
				data-visible={visible || undefined}
				aria-hidden={!visible}
			>
				<Group gap='sm' wrap='nowrap' miw={0}>
					{children}
				</Group>
				{actions}
			</div>
		</div>
	);
}
