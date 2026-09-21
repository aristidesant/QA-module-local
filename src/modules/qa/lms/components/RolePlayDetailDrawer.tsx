import { Badge, Button, Group, List, Stack, Text } from '@mantine/core';
import { IconMasksTheater } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { AppDrawer } from '~/components/AppDrawer';
import { SectionCard } from '~/components/SectionCard';
import type { RolePlayModel } from '~/models/qa';
import {
	ROLE_PLAY_DIFFICULTY_META,
	ROLE_PLAY_PERSONA_META,
} from '../constants';
import { AreaBadge } from './Badges';

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
	const personaMeta = ROLE_PLAY_PERSONA_META[model.persona];
	const PersonaIcon = personaMeta.icon;

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
				<Group gap='xs'>
					<AreaBadge area={model.area} subItem={model.subItem} size='xs' />
					<Badge
						size='xs'
						variant='outline'
						color='gray'
						leftSection={<PersonaIcon size={12} />}
					>
						{t(personaMeta.labelKey)}
					</Badge>
					<Badge size='xs' variant='outline' color='gray'>
						{t(ROLE_PLAY_DIFFICULTY_META[model.difficulty].labelKey)}
					</Badge>
				</Group>

				<SectionCard title={t('agent.rolePlay.objectives')} padding='md'>
					<List size='sm' spacing='xs'>
						{model.objectives.map((objective, i) => (
							<List.Item key={i}>{objective}</List.Item>
						))}
					</List>
				</SectionCard>

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
