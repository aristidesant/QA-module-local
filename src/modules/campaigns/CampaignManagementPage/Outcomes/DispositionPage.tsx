import { useEffect, useRef } from 'react';
import { Button } from '@mantine/core';
import { IconOutbound } from '@tabler/icons-react';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';

import { useDispositionStore } from './dispositionRightComponentStore';
import FallbackRightComponent from '~/components/FallbackRightComponent';
import DispositionCatalogList, {
	DispositionCatalogListHandles,
} from './components/DispositionCatalogList';
import DispositionCatalogNode from './components/DispositionCatalogForm/DispositionCatalogNode';

interface DispositionPageProps {
	embedded?: boolean;
}

const DispositionPage: React.FC<DispositionPageProps> = ({
	embedded = false,
}) => {
	const { rightComponent, catalog, setRightComponent } = useDispositionStore(
		(s: any) => s
	);
	const catalogListRef = useRef<DispositionCatalogListHandles>(null);

	// clean the right component
	useEffect(() => {
		return () => {
			setRightComponent(null);
		};
	}, []);

	const handleAddNew = () => {
		catalogListRef.current?.openCreateForm();
	};

	const content = (
		<>
			<DispositionCatalogList ref={catalogListRef} />
			{catalog && <DispositionCatalogNode catalogId={catalog.id} />}
		</>
	);

	if (embedded) {
		return content;
	}

	return (
		<ContentContainer
			title='Outcomes'
			description='Manage all outcome catalogs.'
			titleIcon={<IconOutbound />}
			titleRight={
				<Button onClick={handleAddNew} size='sm'>
					Add New Catalog
				</Button>
			}
			rightSection={
				rightComponent || (
					<FallbackRightComponent
						title='No catalog selected'
						description={
							'Select an outcome catalog from the list to view and edit its nodes, or create a new catalog to get started.'
						}
						actionText='Use the left list to choose or create a catalog'
					/>
				)
			}
		>
			{content}
		</ContentContainer>
	);
};

export default DispositionPage;
