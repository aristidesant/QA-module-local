import { Stack, Text, Checkbox, Group, Badge, ScrollArea } from '@mantine/core';
import { useTools } from '~/queries/toolQueries';
import type { ToolModel } from '~/models/ToolModel';

interface ToolSectionProps {
	selectedToolIds: string[];
	onToolsChange: (toolIds: string[]) => void;
}

function ToolSection({ selectedToolIds, onToolsChange }: ToolSectionProps) {
	const { data: tools, isLoading } = useTools();

	const handleToolToggle = (toolId: number, checked: boolean) => {
		const toolIdStr = String(toolId);
		if (checked) {
			onToolsChange([...selectedToolIds, toolIdStr]);
		} else {
			onToolsChange(selectedToolIds.filter((id) => id !== toolIdStr));
		}
	};

	if (isLoading) {
		return (
			<Text size='sm' c='dimmed'>
				Loading tools...
			</Text>
		);
	}

	const toolsList = tools || [];

	if (toolsList.length === 0) {
		return (
			<Text size='sm' c='dimmed'>
				No tools available. Create tools in the Tools section first.
			</Text>
		);
	}

	return (
		<Stack gap='xs'>
			<Text size='sm' fw={500}>
				Select Tools
			</Text>
			<ScrollArea h={300}>
				<Stack gap='xs'>
					{toolsList.map((tool: ToolModel) => (
						<Group
							key={tool.id}
							p='xs'
							style={{
								borderRadius: 'var(--mantine-radius-sm)',
								border: '1px solid var(--mantine-color-gray-3)',
							}}
						>
							<Checkbox
								checked={selectedToolIds.includes(String(tool.id))}
								onChange={(e) =>
									handleToolToggle(tool.id, e.currentTarget.checked)
								}
							/>
							<Stack gap={2} style={{ flex: 1 }}>
								<Group gap='xs'>
									<Text size='sm' fw={500}>
										{tool.name}
									</Text>
									{tool.category && (
										<Badge size='xs' variant='light'>
											{tool.category.name}
										</Badge>
									)}
								</Group>
								{tool.description && (
									<Text size='xs' c='dimmed' lineClamp={2}>
										{tool.description}
									</Text>
								)}
							</Stack>
						</Group>
					))}
				</Stack>
			</ScrollArea>
		</Stack>
	);
}

export default ToolSection;
