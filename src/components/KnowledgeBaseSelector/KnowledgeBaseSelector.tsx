import React, { useEffect } from 'react';
import KnowledgeBaseSelectionTable from '~/components/KnowledgeBaseSelectionTable';
import { useKnowledgeBaseSelectionStore } from '~/stores/knowledgeBaseSelectionStore';

export type KnowledgeBaseSelectorProps = {
	initialSelectedIds: number[];
	onCancel: () => void;
	onSave: (ids: number[]) => void;
};

const KnowledgeBaseSelector: React.FC<KnowledgeBaseSelectorProps> = ({
	initialSelectedIds,
	onCancel,
	onSave,
}) => {
	const { reset } = useKnowledgeBaseSelectionStore();

	// Reset store state when component unmounts
	useEffect(() => {
		return () => {
			reset();
		};
	}, [reset]);

	return (
		<KnowledgeBaseSelectionTable
			initialSelectedIds={initialSelectedIds}
			onCancel={onCancel}
			onSave={onSave}
			showFooter
		/>
	);
};

export default KnowledgeBaseSelector;
