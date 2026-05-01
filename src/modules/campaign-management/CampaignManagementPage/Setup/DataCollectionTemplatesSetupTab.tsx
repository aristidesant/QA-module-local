import { useMemo, useState } from 'react';
import { Stack } from '@mantine/core';
import { IconCategory, IconDatabase } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ModalBody } from '~/components/ModalMenu/ModalBody';
import {
	ModalMenu,
	type ModalMenuItem,
} from '~/components/ModalMenu/ModalMenu';
import CustomVariableGroupsPage from '~/modules/campaign-management/data-collection-template-groups/CustomVariableGroupsPage';
import CustomVariablesPage from '~/modules/campaign-management/data-collection-template-variables/CustomVariablesPage';

type DataCollectionTemplateSection = 'groups' | 'variables';

export default function DataCollectionTemplatesSetupTab() {
	const { t } = useTranslation('campaign-management');
	const [activeId, setActiveId] =
		useState<DataCollectionTemplateSection>('groups');
	const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
		null
	);

	const items = useMemo<ModalMenuItem[]>(
		() => [
			{
				id: 'groups',
				label: t('customVariables.groups.label'),
				icon: IconCategory,
			},
			{
				id: 'variables',
				label: t('customVariables.variables.label'),
				icon: IconDatabase,
			},
		],
		[t]
	);

	return (
		<Stack gap='xs'>
			<ModalBody
				menu={
					<ModalMenu
						title={t('customVariables.catalog')}
						items={items}
						activeId={activeId}
						onSelect={(id) => setActiveId(id as DataCollectionTemplateSection)}
					/>
				}
			>
				{activeId === 'groups' && (
					<CustomVariableGroupsPage
						embedded
						selectedTemplateId={selectedTemplateId}
						onTemplateSelect={setSelectedTemplateId}
					/>
				)}
				{activeId === 'variables' && (
					<CustomVariablesPage
						embedded
						selectedTemplateId={selectedTemplateId}
						onTemplateSelect={setSelectedTemplateId}
					/>
				)}
			</ModalBody>
		</Stack>
	);
}
