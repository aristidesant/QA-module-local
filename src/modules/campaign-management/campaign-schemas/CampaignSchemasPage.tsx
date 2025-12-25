import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { IconDatabase, IconPlus } from '@tabler/icons-react';
import CampaignSchemasContent from '~/modules/campaign-management/campaign-schemas/components/CampaignSchemasContent';

interface CampaignSchemasPageProps {
	embedded?: boolean;
}

export default function CampaignSchemasPage({
	embedded = false,
}: CampaignSchemasPageProps) {
	const [createModalOpened, setCreateModalOpened] = useState(false);

	const { t } = useTranslation('campaign-management');

	const content = (
		<CampaignSchemasContent
			createModalOpened={createModalOpened}
			setCreateModalOpened={setCreateModalOpened}
		/>
	);

	if (embedded) {
		return content;
	}

	return (
		<ContentContainer
			title={t('setup.schemas.title')}
			description={t('setup.schemas.description')}
			titleIcon={<IconDatabase size={24} />}
			titleRight={
				<Button
					leftSection={<IconPlus size={16} />}
					onClick={() => setCreateModalOpened(true)}
				>
					{t('setup.schemas.create')}
				</Button>
			}
		>
			{content}
		</ContentContainer>
	);
}
