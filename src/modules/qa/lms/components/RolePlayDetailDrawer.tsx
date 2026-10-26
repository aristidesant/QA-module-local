import { Button, Group, List, Stack, Text } from '@mantine/core';
import { IconMasksTheater } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { AppDrawer } from '~/components/AppDrawer';
import type { RolePlayModel } from '~/models/qa';
import { AreaMark } from './AreaMark';
import { DifficultyDots } from './DifficultyDots';

interface RolePlayDetailDrawerProps {
	model: RolePlayModel | null;
	opened: boolean;
	onClose: () => void;
	onStart: (model: RolePlayModel) => void;
}

export function RolePlayDetailDrawer({
	model,
	opened,
	onClose,
	onStart,
}: RolePlayDetailDrawerProps) {
	const { t } = useTranslation('qa.lms');
	if (!model) return null;

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='lg'
			title={model.name}
			description={model.description}
			icon={<IconMasksTheater size={18} />}
			iconColor='gray'
		>
			<Stack gap='md'>
				<Group gap='md'>
					<AreaMark area={model.area} subItem={model.subItem} size='sm' />
					<DifficultyDots difficulty={model.difficulty} />
				</Group>

				<Stack gap='xs'>
					<Text size='sm' fw={600}>
						{t('agent.rolePlay.objectives')}
					</Text>
					<List size='sm' spacing='xs'>
						{model.objectives.map((objective, i) => (
							<List.Item key={i}>{objective}</List.Item>
						))}
					</List>
				</Stack>

				<Text size='xs' c='dimmed'>
					{t('agent.rolePlay.mockDisclaimer')}
				</Text>

				<Group justify='flex-end'>
					<Button onClick={() => onStart(model)}>
						{t('agent.rolePlay.startPractice')}
					</Button>
				</Group>
			</Stack>
		</AppDrawer>
	);
}

export default RolePlayDetailDrawer;
