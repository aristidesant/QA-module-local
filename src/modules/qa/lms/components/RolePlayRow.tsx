import { Button, Group, Text, ThemeIcon } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { RolePlayModel } from '~/models/qa';
import { ROLE_PLAY_PERSONA_META } from '../constants';
import { AreaMark } from './AreaMark';
import { DifficultyDots } from './DifficultyDots';
import rowClasses from './LearningRow.module.css';

interface RolePlayRowProps {
	model: RolePlayModel;
	onOpen: () => void;
}

export function RolePlayRow({ model, onOpen }: RolePlayRowProps) {
	const { t } = useTranslation('qa.lms');
	const persona = ROLE_PLAY_PERSONA_META[model.persona];
	const PersonaIcon = persona.icon;
	return (
		<div className={rowClasses.row}>
			<ThemeIcon
				size='lg'
				radius='xl'
				variant='light'
				color='gray'
				aria-label={t(persona.labelKey)}
			>
				<PersonaIcon size={18} />
			</ThemeIcon>
			<div className={rowClasses.main}>
				<Text size='sm' fw={600}>
					{model.name}
				</Text>
				<Text size='sm'>{model.description}</Text>
				<Group gap='md' wrap='wrap'>
					<AreaMark area={model.area} subItem={model.subItem} />
					<DifficultyDots difficulty={model.difficulty} />
				</Group>
			</div>
			<Button size='xs' variant='subtle' onClick={onOpen}>
				{t('agent.rolePlay.practice')}
			</Button>
		</div>
	);
}
