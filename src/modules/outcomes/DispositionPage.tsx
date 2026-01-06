import { useEffect, useRef, useState, useCallback } from 'react';
import { Button, Modal, Text } from '@mantine/core';
import { IconOutbound } from '@tabler/icons-react';
import { ContentContainer } from '~/components/ContentContainer/ContentContainer';

import { useDispositionStore } from './dispositionRightComponentStore';
import DispositionCatalogList, {
	DispositionCatalogListHandles,
} from './components/DispositionCatalogList';
import DispositionCatalogNode from './components/DispositionCatalogForm/DispositionCatalogNode';
import usePermissions from '~/hooks/usePermissions';
import { ModuleEnum } from '~/constants/ModuleEnum';
import { PermissionEnum } from '~/constants/PermissionEnum';

interface DispositionPageProps {
	embedded?: boolean;
}

const DispositionPage: React.FC<DispositionPageProps> = ({
	embedded = false,
}) => {
	const catalog = useDispositionStore((state) => state.catalog);
	const clearCatalog = useDispositionStore((state) => state.clearCatalog);
	const catalogListRef = useRef<DispositionCatalogListHandles>(null);
	const { canPerformAction } = usePermissions();
	const [nodesModalOpen, setNodesModalOpen] = useState(false);

	const canCreate = canPerformAction(
		ModuleEnum.SETTINGS,
		PermissionEnum.CREATE
	);

	useEffect(() => {
		return () => {
			clearCatalog();
		};
	}, [clearCatalog]);

	const handleOpenNodesModal = useCallback(() => {
		setNodesModalOpen(true);
	}, []);

	const handleAddNew = () => {
		catalogListRef.current?.openCreateForm();
	};

	const content = (
		<>
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
				canCreate && (
					<Button onClick={handleAddNew} size='sm'>
						Add New Catalog
					</Button>
				)
			}
		>
			{content}
		</ContentContainer>
	);
};

export default DispositionPage;
