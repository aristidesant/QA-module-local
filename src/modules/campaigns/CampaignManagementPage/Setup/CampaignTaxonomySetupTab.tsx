import { useMemo, useState } from 'react';
import { Stack } from '@mantine/core';
import { IconCategory, IconSchema, IconTarget } from '@tabler/icons-react';
import { ModalBody } from '~/components/ModalMenu/ModalBody';
import {
	ModalMenu,
	type ModalMenuItem,
} from '~/components/ModalMenu/ModalMenu';
import CampaignCategoriesPage from '../Categories/CampaignCategoriesPage';
import CampaignObjectivesPage from '../Objectives/CampaignObjectivesPage';
import CampaignSchemasPage from '../Schemas/CampaignSchemasPage';

type TaxonomySection = 'schemas' | 'objectives' | 'categories';

export default function CampaignTaxonomySetupTab() {
	const [activeId, setActiveId] = useState<TaxonomySection>('categories');

	const items = useMemo<ModalMenuItem[]>(
		() => [
			{ id: 'categories', label: 'Categories', icon: IconCategory },
			{ id: 'objectives', label: 'Objectives', icon: IconTarget },
			{ id: 'schemas', label: 'Schemas', icon: IconSchema },
		],
		[]
	);

	return (
		<Stack gap='xs'>
			<ModalBody
				menu={
					<ModalMenu
						title='Catalog'
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
