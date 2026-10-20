import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@mantine/core';
import type { ConfigStatus } from '../types';
import classes from '../GlobalConfig.module.css';

/** Status reads as a dot plus text; green is reserved for the active state. */
export const StatusDot: React.FC<{ status: ConfigStatus }> = ({ status }) => {
	const { t } = useTranslation('qa.globalConfig');
	return (
		<span className={classes.statusDot}>
			<span
				className={[classes.dot, status === 'ACTIVE' ? classes.dotActive : '']
					.filter(Boolean)
					.join(' ')}
				aria-hidden
			/>
			<Text size='sm' component='span'>
				{t(`common.${status === 'ACTIVE' ? 'active' : 'inactive'}`)}
			</Text>
		</span>
	);
};

export default StatusDot;
