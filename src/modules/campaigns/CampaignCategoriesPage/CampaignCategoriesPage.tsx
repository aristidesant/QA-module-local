import { Button } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { CampaignCategoriesContent } from '../CampaignCategoriesContent';
import { IconCategory, IconPlus } from '@tabler/icons-react';

export default function CampaignCategoriesPage() {
	return (
		<ContentContainer
			title='Campaign Categories'
			description='Organize and manage campaign categories to better structure your campaigns'
			titleIcon={<IconCategory size={24} />}
			titleRight={
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={() => {
						// This will be handled by the child component
						const event = new CustomEvent('openCreateCategoryModal');
						window.dispatchEvent(event);
					}}
				>
					Create Category
				</Button>
			}
		>
			<CampaignCategoriesContent />
		</ContentContainer>
	);
}
