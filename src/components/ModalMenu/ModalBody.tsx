import React from 'react';
import styles from './ModalBody.module.css';

interface ModalBodyProps {
	menu: React.ReactNode;
	children: React.ReactNode;
}

export const ModalBody: React.FC<ModalBodyProps> = ({ menu, children }) => {
	return (
		<div className={styles.body}>
			{menu}
			{children}
		</div>
	);
};
