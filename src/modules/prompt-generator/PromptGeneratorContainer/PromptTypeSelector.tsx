import React from 'react';
import {
	Card,
	Group,
	Text,
	Stack,
	Title,
	ThemeIcon,
	Loader,
} from '@mantine/core';
import classes from './PromptTypeSelector.module.css';
import { useGetAllPromptTypes } from '~/queries/promptTypesQueries';
import getIcon from '~/utils/iconUtils';
import { useGetAllPromptCategories } from '~/queries/promptCategoryQueries';

export interface PromptTypeSelectorProps {
	types: string[];
	selectedType: number | null;
	onSelect: (type: number | null) => void;
}

export const PromptTypeSelector: React.FC<PromptTypeSelectorProps> = ({
	selectedType,
	onSelect,
}) => {
	const {
		data: categories,
		isLoading: isLoadingCategories,
		isFetching: isFetchingCategories,
	} = useGetAllPromptCategories();
	const [selectedCategory, setSelectedCategory] = React.useState<number | null>(
		null
	);
	const {
		data: promptTypes,
		isLoading,
		isFetching,
	} = useGetAllPromptTypes({
		...(selectedCategory ? { categoryId: `${selectedCategory}` } : {}),
	});
	return (
		<div className={classes.typeSelectorWrapper}>
			<Title order={3} className={classes.typeSelectorTitle}>
				Select a prompt type
			</Title>
			<Group justify='center' gap='xl'>
				{isLoading ||
				isFetching ||
				isFetchingCategories ||
				isLoadingCategories ? (
					<Loader size='lg' color='blue' />
				) : (
					<>
						{selectedCategory
							? promptTypes?.map((type) => (
									<Card
										key={type.id}
										withBorder
										radius='md'
										className={
											selectedType === type.id
												? classes.typeCardSelected
												: classes.typeCard
										}
										onClick={() => onSelect(type.id)}
										onKeyDown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												onSelect(type.id);
											}
										}}
										tabIndex={0}
										role='button'
										aria-pressed={selectedType === type?.id}
										aria-label={`Select prompt type: ${type.name}`}
									>
										<Stack align='center' gap={8}>
											<ThemeIcon
												variant='light'
												size={100}
												className={classes.typeIcon}
											>
												{getIcon(type.icon || undefined, { size: 70 })}
											</ThemeIcon>
											<Text className={classes.typeTitle} tt='capitalize'>
												{type.name}
											</Text>
											<Text className={classes.typeDescription}>
												{type.description}
											</Text>
										</Stack>
									</Card>
								))
							: categories?.map((category) => (
									<Card
										key={category.id}
										withBorder
										radius='md'
										className={
											selectedCategory === category.id
												? classes.typeCardSelected
												: classes.typeCard
										}
										onClick={() => {
											setSelectedCategory(category.id);
										}}
										onKeyDown={(e) => {
											if (e.key === 'Enter' || e.key === ' ') {
												setSelectedCategory(category.id);
											}
										}}
										tabIndex={0}
										role='button'
										aria-pressed={selectedCategory === category?.id}
										aria-label={`Select prompt category: ${category.name}`}
									>
										<Stack align='center' gap={8}>
											<ThemeIcon
												variant='light'
												size={100}
												className={classes.typeIcon}
											>
												{getIcon(category.icon || undefined, { size: 70 })}
											</ThemeIcon>
											<Text className={classes.typeTitle} tt='capitalize'>
												{category.name}
											</Text>
											<Text className={classes.typeDescription}>
												{category.description}
											</Text>
										</Stack>
									</Card>
								))}
					</>
				)}
			</Group>
		</div>
	);
};
