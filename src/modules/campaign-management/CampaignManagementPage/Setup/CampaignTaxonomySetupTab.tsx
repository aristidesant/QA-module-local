import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack } from '@mantine/core';
import { IconCategory, IconSchema, IconTarget } from '@tabler/icons-react';
import { ModalBody } from '~/components/ModalMenu/ModalBody';
import {
	ModalMenu,
	type ModalMenuItem,
} from '~/components/ModalMenu/ModalMenu';
import CampaignCategoriesPage from '~/modules/campaign-management/campaign-categories/CampaignCategoriesPage';
import CampaignObjectivesPage from '~/modules/campaign-management/campaign-objectives/CampaignObjectivesPage';
import CampaignSchemasPage from '~/modules/campaign-management/campaign-schemas/CampaignSchemasPage';

type TaxonomySection = 'schemas' | 'objectives' | 'categories';

export default function CampaignTaxonomySetupTab() {
	const [activeId, setActiveId] = useState<TaxonomySection>('categories');

	const { t } = useTranslation('campaign-management');

	const items = useMemo<ModalMenuItem[]>(
		() => [
			{
				id: 'categories',
				label: t('setup.categories.label'),
				icon: IconCategory,
			},
			{
				id: 'objectives',
				label: t('setup.objectives.label'),
				icon: IconTarget,
			},
			{ id: 'schemas', label: t('setup.schemas.label'), icon: IconSchema },
		],
		[t]
	);

	return (
		<Stack gap='xs'>
			<ModalBody
				menu={
					<ModalMenu
						title={t('setup.catalog')}
						items={items}
						activeId={activeId}
						onSelect={(id) => setActiveId(id as TaxonomySection)}
					/>
				}
			>
				{activeId === 'schemas' && <CampaignSchemasPage embedded />}
				{activeId === 'objectives' && <CampaignObjectivesPage embedded />}
				{activeId === 'categories' && <CampaignCategoriesPage embedded />}
			</ModalBody>
		</Stack>
	);
}
