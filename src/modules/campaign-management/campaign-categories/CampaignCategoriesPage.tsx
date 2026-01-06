import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import CampaignCategoriesContent from '~/modules/campaign-management/campaign-categories/components/CampaignCategoriesContent';
import { IconCategory, IconPlus } from '@tabler/icons-react';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';

interface CampaignCategoriesPageProps {
	embedded?: boolean;
}

export default function CampaignCategoriesPage({
	embedded = false,
}: CampaignCategoriesPageProps) {
	const [createModalOpened, setCreateModalOpened] = useState(false);

	const { t } = useTranslation('campaign-management');
	const { canPerformAction, canAccessModule } = usePermissions();

	if (!canAccessModule(ModuleEnum.SETTINGS)) {
		return null;
	}

	const content = (
		<CampaignCategoriesContent
			createModalOpened={createModalOpened}
			setCreateModalOpened={setCreateModalOpened}
		/>
	);

	if (embedded) {
		return content;
	}

	return (
		<ContentContainer
			title={t('setup.categories.title')}
			description={t('setup.categories.description')}
			titleIcon={<IconCategory size={24} />}
			titleRight={
				canPerformAction(ModuleEnum.SETTINGS, PermissionEnum.CREATE) && (
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={() => setCreateModalOpened(true)}
					>
						{t('setup.categories.create')}
					</Button>
				)
			}
		>
			{content}
		</ContentContainer>
	);
}
