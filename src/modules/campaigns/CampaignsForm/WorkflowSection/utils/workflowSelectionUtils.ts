export const isWorkflowMultiSelectClick = ({
	ctrlKey,
	metaKey,
}: Pick<MouseEvent, 'ctrlKey' | 'metaKey'>) => ctrlKey || metaKey;
