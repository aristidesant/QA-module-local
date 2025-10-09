import { useState } from 'react';
import { Button } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { IconDatabase, IconPlus } from '@tabler/icons-react';
import { CampaignSchemasContent } from '../CampaignSchemasContent';

export default function CampaignSchemasPage() {
	const [createModalOpened, setCreateModalOpened] = useState(false);

	return (
		<ContentContainer
			title='Campaign Schemas'
			description='Define and manage contact data schemas for your campaigns'
			titleIcon={<IconDatabase size={24} />}
			titleRight={
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={() => setCreateModalOpened(true)}
				>
					Create Schema
				</Button>
			}
		>
			<CampaignSchemasContent
				createModalOpened={createModalOpened}
				setCreateModalOpened={setCreateModalOpened}
			/>
		</ContentContainer>
	);
}
