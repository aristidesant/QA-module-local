import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { Stack, Center, Loader, Text, Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import useToolsStore from '~/stores/toolsStore';
import ToolsList from '../ToolsList';
import { useState, useCallback, useEffect } from 'react';
import ToolsModal from './ToolsModal';
import { useToolCategories } from '~/queries/toolCategoryQueries';
import { useTranslation } from 'react-i18next';

const ToolsPage = () => {
	const { t } = useTranslation('tools');
	// Local state for modal
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedToolId, setSelectedToolId] = useState<
		string | number | undefined
	>(undefined);

	// We can assume we want to create tools in the currently selected category (or default)
	const { selectedToolCategory, setToolsCategory } = useToolsStore(
		(state) => state
	);
	const { data: categories = [], isLoading: isLoadingCategories } =
		useToolCategories();

	// Default to 'webhook' category
	useEffect(() => {
		if (!categories || categories.length === 0) return;
		if (selectedToolCategory) return;

		const webhook = categories.find(
			(c) => String(c.name).toLowerCase() === 'webhook'
		);

		if (webhook) {
			setToolsCategory(webhook);
		}
	}, [categories, selectedToolCategory, setToolsCategory]);

	const handleCreateTool = useCallback(() => {
		setSelectedToolId(undefined);
		setIsModalOpen(true);
	}, []);

	const handleEditTool = useCallback((toolId: string | number) => {
		setSelectedToolId(toolId);
		setIsModalOpen(true);
	}, []);

	const handleCloseModal = useCallback(() => {
		setIsModalOpen(false);
		setSelectedToolId(undefined);
	}, []);

	if (isLoadingCategories && !selectedToolCategory) {
		return (
			<Center h='100%'>
				<Stack align='center'>
					<Loader size='sm' />
					<Text size='sm' c='dimmed'>
						{t('state.loadingTools')}
					</Text>
				</Stack>
			</Center>
		);
	}

	return (
		<>
			<ContentContainer
				title={t('page.title')}
				description={t('page.description')}
				titleRight={
					<Button
						leftSection={<IconPlus size={16} />}
						onClick={handleCreateTool}
						variant='filled'
						size='xs'
					>
						{t('actions.createTool')}
					</Button>
				}
			>
				<Stack>
					<ToolsList onCreate={handleCreateTool} onEdit={handleEditTool} />
				</Stack>
			</ContentContainer>

			<ToolsModal
				opened={isModalOpen}
				onClose={handleCloseModal}
				toolId={selectedToolId}
				categoryId={selectedToolCategory?.id}
			/>
		</>
	);
};

export default ToolsPage;
