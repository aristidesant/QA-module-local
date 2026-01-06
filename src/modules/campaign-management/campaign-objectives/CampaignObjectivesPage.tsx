import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import CampaignObjectivesContent from '~/modules/campaign-management/campaign-objectives/components/CampaignObjectivesContent';
import { IconTarget, IconPlus } from '@tabler/icons-react';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';

interface CampaignObjectivesPageProps {
	embedded?: boolean;
}

export default function CampaignObjectivesPage({
	embedded = false,
}: CampaignObjectivesPageProps) {
	const [createModalOpened, setCreateModalOpened] = useState(false);

	const { t } = useTranslation('campaign-management');
	const { canPerformAction, canAccessModule } = usePermissions();

	if (!canAccessModule(ModuleEnum.SETTINGS)) {
		return null;
	}

	const content = (
		<CampaignObjectivesContent
			createModalOpened={createModalOpened}
			setCreateModalOpened={setCreateModalOpened}
		/>
	);

	if (embedded) {
		return content;
	}

	return (
		<ContentContainer
			title={t('setup.objectives.title')}
			description={t('setup.objectives.description')}
			titleIcon={<IconTarget size={24} />}
			titleRight={
				canPerformAction(ModuleEnum.SETTINGS, PermissionEnum.CREATE) && (
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={() => setCreateModalOpened(true)}
					>
						{t('setup.objectives.create')}
					</Button>
				)
			}
		>
			{content}
		</ContentContainer>
	);
}
