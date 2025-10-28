import React from 'react';
import { Grid, Paper, ScrollArea } from '@mantine/core';
import DispositionCatalogMenu from './DispositionCatalogMenu';
import DispositionBuilder from './DispositionBuilder/DispositionBuilder';
import styles from './DispositionForm.module.css';

interface DispositionFormProps {
	onComplete?: () => void;
}

const DispositionForm: React.FC<DispositionFormProps> = ({ onComplete }) => {
	return (
		<div className={styles.wrapper}>
			<Grid gutter='md' h='100%'>
				<Grid.Col span={3}>
					<Paper className={styles.leftSection} withBorder p={'xs'}>
						<ScrollArea h={'100%'}>
							<DispositionCatalogMenu />
						</ScrollArea>
					</Paper>
				</Grid.Col>
				<Grid.Col span={9}>
					<Paper className={styles.rightSection} withBorder>
						<DispositionBuilder onComplete={onComplete} />
					</Paper>
				</Grid.Col>
			</Grid>
		</div>
	);
};

export default DispositionForm;
