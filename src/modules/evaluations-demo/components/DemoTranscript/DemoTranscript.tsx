import React from 'react';
import { Badge, Text } from '@mantine/core';
import type { DemoTranscriptTurn } from '../../mockData';
import styles from './DemoTranscript.module.css';

interface DemoTranscriptProps {
	turns: DemoTranscriptTurn[];
}

const DemoTranscript: React.FC<DemoTranscriptProps> = ({ turns }) => {
	return (
		<div className={styles.list}>
			{turns.map((turn) => (
				<div key={turn.id} className={styles.turn}>
					<div className={styles.meta}>
						<Badge
							size='xs'
							variant='light'
							color={turn.role === 'agent' ? 'blue' : 'grape'}
						>
							{turn.role === 'agent' ? 'Agent' : 'Customer'}
						</Badge>
						<Text size='xs' c='dimmed'>
							{turn.timestamp}
						</Text>
					</div>
					<Text size='sm'>{turn.text}</Text>
				</div>
			))}
		</div>
	);
};

export default DemoTranscript;
