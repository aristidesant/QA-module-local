import { useState } from 'react';
import { Button } from '@mantine/core';
import { IconSettings, IconPlus } from '@tabler/icons-react';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { ClientConfigsContent } from '../ClientConfigsContent';

export default function ClientConfigsPage() {
	const [createModalOpened, setCreateModalOpened] = useState(false);

	return (
		<ContentContainer
			title='Client Configurations'
			description='Manage client configuration settings'
			titleIcon={<IconSettings size={24} />}
			titleRight={
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={() => setCreateModalOpened(true)}
				>
					Create Configuration
				</Button>
			}
		>
			<ClientConfigsContent
				createModalOpened={createModalOpened}
				setCreateModalOpened={setCreateModalOpened}
			/>
		</ContentContainer>
	);
}
