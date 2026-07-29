import React from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { useSidebarStore } from '~/stores/sidebarStore';
import styles from './DemoWizardKit.module.css';

interface WizardFooterProps {
	children: React.ReactNode;
}

const WizardFooter: React.FC<WizardFooterProps> = ({ children }) => {
	const collapsed = useSidebarStore((state) => state.collapsed);
	const isMobile = useMediaQuery('(max-width: 768px)', false, {
		getInitialValueInEffect: false,
	});
	const left = isMobile
		? 0
		: collapsed
			? 'var(--sidebar-width-collapsed)'
			: 'var(--sidebar-width)';

	return (
		<div className={styles.footerRow} style={{ left }}>
			{children}
		</div>
	);
};

export default WizardFooter;
