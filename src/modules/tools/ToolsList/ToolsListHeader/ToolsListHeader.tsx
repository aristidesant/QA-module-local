import { Group, Text, Button } from '@mantine/core';
import { IconTool, IconPlus } from '@tabler/icons-react';
import type { ToolCategoryModel } from '~/models/ToolCategoryModel';
import { useTranslation } from 'react-i18next';

interface ToolsListHeaderProps {
	category?: ToolCategoryModel;
	onCreate: () => void;
	toolCount?: number;
}

function ToolsListHeader({
	category,
	onCreate,
	toolCount,
}: ToolsListHeaderProps) {
	const { t } = useTranslation('tools');

	return (
		<Group align='center' justify='space-between' mb='md' p='md'>
			<Group gap='sm' align='center'>
				<IconTool size={20} />
				<Text size='lg' fw={600} tt={'uppercase'}>
					{typeof toolCount === 'number'
						? t('list.header.titleWithCount', {
								categoryName: category?.name,
								count: toolCount,
							})
						: t('list.header.title', { categoryName: category?.name })}
				</Text>
			</Group>
			<Button
				leftSection={<IconPlus size={16} />}
				onClick={onCreate}
				variant='light'
				size='sm'
			>
				{t('actions.createNewTool')}
			</Button>
		</Group>
	);
}

export default ToolsListHeader;
