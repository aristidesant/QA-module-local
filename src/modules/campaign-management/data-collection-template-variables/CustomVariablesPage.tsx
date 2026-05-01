import { useState } from 'react';
import { Button } from '@mantine/core';
import { IconDatabase, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';
import CustomVariablesContent from './components/CustomVariablesContent';

interface CustomVariablesPageProps {
	embedded?: boolean;
	selectedTemplateId?: number | null;
	onTemplateSelect?: (templateId: number | null) => void;
}

export default function CustomVariablesPage({
	embedded = false,
	selectedTemplateId,
	onTemplateSelect,
}: CustomVariablesPageProps) {
	const { t } = useTranslation('campaign-management');
	const { canAccessModule, canPerformAction } = usePermissions();
	const [createModalOpened, setCreateModalOpened] = useState(false);

	if (!canAccessModule(ModuleEnum.SETTINGS)) {
		return null;
	}

	const content = (
		<CustomVariablesContent
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
			title={t('customVariables.variables.title')}
			description={t('customVariables.variables.description')}
			titleIcon={<IconDatabase size={24} />}
			titleRight={
				canPerformAction(ModuleEnum.SETTINGS, PermissionEnum.CREATE) && (
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={() => setCreateModalOpened(true)}
					>
						{t('customVariables.variables.create')}
					</Button>
				)
			}
		>
			{content}
		</ContentContainer>
	);
}
