import React from 'react';
import { Text, type TextProps } from '@mantine/core';
import classes from '../GlobalConfig.module.css';

/** Monospace inline text for identifiers (topics, codes, filenames). */
export const CodeText: React.FC<TextProps & { children: React.ReactNode }> = ({
	className,
	children,
	...props
}) => (
	<Text
		component='span'
		className={[classes.code, className].filter(Boolean).join(' ')}
		{...props}
	>
		{children}
	</Text>
);

export default CodeText;
