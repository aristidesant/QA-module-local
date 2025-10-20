import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import DispositionCatalogList, {
	DispositionCatalogListHandles,
} from '../DispositionCatalogList';
import { useDispositionStore } from '../dispositionRightComponentStore';
import DispositionCatalogNode from '../DispositionCatalogForm/DispositionCatalogNode';
import FallbackRightComponent from '~/components/FallbackRightComponent';
import { useEffect, useRef } from 'react';
import { Button } from '@mantine/core';
import { IconOutbound } from '@tabler/icons-react';

const DispositionPage: React.FC = () => {
	const { rightComponent, catalog, setRightComponent } = useDispositionStore(
		(s) => s
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
			<DispositionCatalogList ref={catalogListRef} />
			{catalog && <DispositionCatalogNode catalogId={catalog.id} />}
		</ContentContainer>
	);
};

export default DispositionPage;
