import { useState } from 'react';
import { Button } from '@mantine/core';
import { IconCategory, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import CustomVariableGroupsContent from './components/CustomVariableGroupsContent';

interface CustomVariableGroupsPageProps {
	embedded?: boolean;
	selectedTemplateId?: number | null;
	onTemplateSelect?: (templateId: number | null) => void;
}

export default function CustomVariableGroupsPage({
	embedded = false,
	selectedTemplateId,
	onTemplateSelect,
}: CustomVariableGroupsPageProps) {
	const { t } = useTranslation('campaign-management');
	const { canAccessModule, canPerformAction } = usePermissions();
	const [createModalOpened, setCreateModalOpened] = useState(false);

	if (!canAccessModule(ModuleEnum.SETTINGS)) {
		return null;
	}

	const content = (
		<CustomVariableGroupsContent
			createModalOpened={createModalOpened}
			setCreateModalOpened={setCreateModalOpened}
			selectedTemplateId={selectedTemplateId ?? null}
			onTemplateSelect={onTemplateSelect}
		/>
	);

	if (embedded) {
		return content;
	}

	return (
		<ContentContainer
			title={t('customVariables.groups.title')}
			description={t('customVariables.groups.description')}
			titleIcon={<IconCategory size={24} />}
			titleRight={
				canPerformAction(ModuleEnum.SETTINGS, PermissionEnum.CREATE) && (
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={() => setCreateModalOpened(true)}
					>
						{t('customVariables.groups.create')}
					</Button>
				)
			}
		>
			{content}
		</ContentContainer>
	);
}
