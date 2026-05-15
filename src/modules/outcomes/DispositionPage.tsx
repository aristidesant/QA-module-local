import { useEffect, useRef, useState, useCallback } from 'react';
import { Modal, Text } from '@mantine/core';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';

import { useDispositionStore } from './dispositionRightComponentStore';
import DispositionCatalogList, {
	DispositionCatalogListHandles,
} from './components/DispositionCatalogList';
import DispositionCatalogNode from './components/DispositionCatalogForm/DispositionCatalogNode';

const DispositionPage: React.FC = () => {
	const catalog = useDispositionStore((state) => state.catalog);
	const clearCatalog = useDispositionStore((state) => state.clearCatalog);
	const catalogListRef = useRef<DispositionCatalogListHandles>(null);
	const [nodesModalOpen, setNodesModalOpen] = useState(false);

	useEffect(() => {
		return () => {
			clearCatalog();
		};
	}, [clearCatalog]);

	const handleOpenNodesModal = useCallback(() => {
		setNodesModalOpen(true);
	}, []);

	return (
		<ContentContainer>
			<DispositionCatalogList
				ref={catalogListRef}
				onEditNodes={handleOpenNodesModal}
			/>
			<Modal
				opened={nodesModalOpen && !!catalog}
				onClose={() => setNodesModalOpen(false)}
				title={
					<div>
						<Text size='sm' fw={600}>
							Edit outcomes
						</Text>
						{catalog?.name ? (
							<Text size='xs' c='dimmed'>
								{catalog.name}
							</Text>
						) : null}
					</div>
				}
				size='xl'
				centered
			>
				{nodesModalOpen && catalog ? (
					<DispositionCatalogNode catalogId={catalog.id} />
				) : null}
			</Modal>
		</ContentContainer>
	);
};

export default DispositionPage;
