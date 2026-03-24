import { ContentContainer } from '~/components/ContentContainer/ContentContainer';
import { Stack, Center, Loader, Text } from '@mantine/core';
import useToolsStore from '~/stores/toolsStore';
import ToolsList from '../ToolsList';
import { useState, useCallback, useEffect } from 'react';
import { useToolCategories } from '~/queries/toolCategoryQueries';
import { useTranslation } from 'react-i18next';
import ToolForm from '../ToolForm';
import SectionCard from '~/components/SectionCard/SectionCard';

const ToolsPage = () => {
	const { t } = useTranslation('tools');
	const [view, setView] = useState<'list' | 'form'>('list');
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
		setView('form');
	}, []);

	const handleEditTool = useCallback((toolId: string | number) => {
		setSelectedToolId(toolId);
		setView('form');
	}, []);

	const handleCloseForm = useCallback(() => {
		setView('list');
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

	if (view === 'form') {
		return (
			<ContentContainer
				showBackButton
				onBackClick={handleCloseForm}
				contentWidth='full'
			>
				<Stack>
					<ToolForm
						toolId={selectedToolId}
						categoryId={selectedToolCategory?.id}
						onSuccess={handleCloseForm}
						onCancel={handleCloseForm}
					/>
				</Stack>
			</ContentContainer>
		);
	}

	return (
		<ContentContainer mainScroll={false}>
			<SectionCard
				title={t('page.title')}
				description={t('page.description')}
				onAdd={handleCreateTool}
				padding='lg'
			>
				<ToolsList onEdit={handleEditTool} />
			</SectionCard>
		</ContentContainer>
	);
};

export default ToolsPage;
