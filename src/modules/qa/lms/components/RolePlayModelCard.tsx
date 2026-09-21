import { Badge, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { RolePlayModel } from '~/models/qa';
import {
	ROLE_PLAY_DIFFICULTY_META,
	ROLE_PLAY_PERSONA_META,
} from '../constants';
import { AreaBadge } from './Badges';
import classes from './Cards.module.css';

interface RolePlayModelCardProps {
	model: RolePlayModel;
	locked: boolean;
	onOpen: () => void;
}

export function RolePlayModelCard({
	model,
	locked,
	onOpen,
}: RolePlayModelCardProps) {
	const { t } = useTranslation('qa.lms');
	const personaMeta = ROLE_PLAY_PERSONA_META[model.persona];
	const PersonaIcon = personaMeta.icon;

	return (
		<Paper
			withBorder
			p='md'
			radius='md'
			className={locked ? undefined : classes.pointer}
			opacity={locked ? 0.6 : 1}
			onClick={locked ? undefined : onOpen}
		>
			<Stack gap='xs'>
				<Group justify='space-between' align='flex-start' wrap='nowrap'>
					<Group gap='xs' align='flex-start' wrap='nowrap' flex={1} miw={0}>
						<ThemeIcon size='md' variant='light' color='gray'>
							<PersonaIcon size={16} />
						</ThemeIcon>
						<Stack gap={2} flex={1} miw={0}>
							<Text fw={600} size='sm'>
								{model.name}
							</Text>
							<Text size='xs' c='dimmed'>
								{t(personaMeta.labelKey)} ·{' '}
								{t(ROLE_PLAY_DIFFICULTY_META[model.difficulty].labelKey)}
							</Text>
						</Stack>
					</Group>
					{locked && (
						<Badge
							size='xs'
							color='gray'
							variant='light'
							leftSection={<IconLock size={12} />}
						>
							{t('agent.rolePlay.lockedBadge')}
						</Badge>
					)}
				</Group>

				<AreaBadge area={model.area} subItem={model.subItem} size='xs' />

				<Text size='xs' c='dimmed'>
					{model.description}
				</Text>

				{locked && (
					<Text size='xs' c='dimmed' fs='italic'>
						{t('agent.rolePlay.lockedHint')}
					</Text>
				)}
			</Stack>
		</Paper>
	);
}

export default RolePlayModelCard;
