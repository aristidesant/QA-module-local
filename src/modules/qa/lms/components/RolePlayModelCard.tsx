import { Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
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
	onOpen: () => void;
}

export function RolePlayModelCard({ model, onOpen }: RolePlayModelCardProps) {
	const { t } = useTranslation('qa.lms');
	const personaMeta = ROLE_PLAY_PERSONA_META[model.persona];
	const PersonaIcon = personaMeta.icon;

	return (
		<Paper
			withBorder
			p='md'
			radius='md'
			className={classes.pointer}
			onClick={onOpen}
			h='100%'
		>
			<Stack gap='xs'>
				<Group gap='xs' align='flex-start' wrap='nowrap'>
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

				<AreaBadge area={model.area} subItem={model.subItem} size='xs' />

				<Text size='xs' c='dimmed'>
					{model.description}
				</Text>
			</Stack>
		</Paper>
	);
}

export default RolePlayModelCard;
