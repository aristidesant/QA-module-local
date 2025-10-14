import { useState } from 'react';
import { Button, Group } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import ContentContainer from '~/components/ContentContainer';
import SectionTitle from '~/components/SectionTitle';

import styles from './ClientConfigsPage.module.css';
import { ClientConfigsContent } from '../ClientConfigsContent';

export default function ClientConfigsPage() {
	const [createModalOpened, setCreateModalOpened] = useState(false);

	return (
		<ContentContainer>
			<div className={styles.pageContainer}>
				<Group justify='space-between' className={styles.headerGroup}>
					<SectionTitle
						title='Client Configurations'
						description='Manage client configuration settings'
					/>
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={() => setCreateModalOpened(true)}
						className={styles.createButton}
					>
						Create Configuration
					</Button>
				</Group>

				<ClientConfigsContent
					createModalOpened={createModalOpened}
					setCreateModalOpened={setCreateModalOpened}
				/>
			</div>
		</ContentContainer>
	);
}
