import { useMemo, useEffect } from 'react';
import {
	Card,
	Text,
	Loader,
	Center,
	Stack,
	SegmentedControl,
} from '@mantine/core';
import { useToolCategories } from '~/queries/toolCategoryQueries';
import useToolsStore from '~/stores/toolsStore';

const ToolsCategories = () => {
	const { data: categories = [], isLoading, error } = useToolCategories();
	const selectedToolCategory = useToolsStore((s) => s.selectedToolCategory);
	const setToolsCategory = useToolsStore((s) => s.setToolsCategory);

	const items = useMemo(() => {
		return categories.map((cat) => ({
			id: String(cat.id),
			name: cat.name,
			// some backends include relational counts in _count; guard with any
			count: (cat as any)?._count?.tools as number | undefined,
		}));
	}, [categories]);

	// Select 'webhook' by default when categories load and nothing is selected
	useEffect(() => {
		if (!categories || categories.length === 0) return;
		if (selectedToolCategory) return; // user already has a selection

		const webhook = categories.find(
			(c) => String(c.name).toLowerCase() === 'webhook'
		);
		if (webhook) setToolsCategory(webhook, null);
	}, [categories, selectedToolCategory, setToolsCategory]);
	const segmentData = useMemo(
		() =>
			items.map((it) => ({
				label: it.name,
				value: it.id,
			})),
		[items]
	);

	if (isLoading)
		return (
			<Center>
				<Stack align='center' gap='xs'>
					<Loader size='sm' />
					<Text size='sm'>Loading categories</Text>
				</Stack>
			</Center>
		);

	if (error)
		return (
			<Center>
				<Text c='red'>Error loading categories</Text>
			</Center>
		);

	if (!items.length)
		return (
			<Card withBorder radius='md' p='lg'>
				<Stack gap='xs'>
					<Text fw={600}>No categories yet</Text>
					<Text size='sm' c='dimmed'>
						Create a category to group your tools and speed up discovery.
					</Text>
				</Stack>
			</Card>
		);

	const selectedValue = selectedToolCategory
		? String(selectedToolCategory.id)
		: '';

	return (
		<SegmentedControl
			fullWidth
			value={selectedValue}
			onChange={(value) => {
				const cat = categories.find((c) => String(c.id) === value) || null;
				setToolsCategory(cat, null);
			}}
			data={segmentData}
		/>
	);
};

export default ToolsCategories;
