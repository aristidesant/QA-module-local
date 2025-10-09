import { useState } from 'react';
import { Button } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { CampaignCategoriesContent } from '../CampaignCategoriesContent';
import { IconCategory, IconPlus } from '@tabler/icons-react';

export default function CampaignCategoriesPage() {
	const [createModalOpened, setCreateModalOpened] = useState(false);

	return (
		<ContentContainer
			title='Campaign Categories'
			description='Organize and manage campaign categories to better structure your campaigns'
			titleIcon={<IconCategory size={24} />}
			titleRight={
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={() => setCreateModalOpened(true)}
				>
					Create Category
				</Button>
			}
		>
			<CampaignCategoriesContent
				createModalOpened={createModalOpened}
				setCreateModalOpened={setCreateModalOpened}
			/>
		</ContentContainer>
	);
}
