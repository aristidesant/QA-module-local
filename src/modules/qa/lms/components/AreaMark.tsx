import { Group, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { LmsArea } from '~/models/qa';
import { LMS_AREA_META } from '../constants';
import areaClasses from './area.module.css';
import classes from './AreaMark.module.css';

interface AreaMarkProps {
	area: LmsArea;
	subItem?: string | null;
	size?: 'xs' | 'sm';
}

/** Area identity: a small swatch in the area hue and the label. Never a chip. */
export function AreaMark({ area, subItem, size = 'xs' }: AreaMarkProps) {
	const { t } = useTranslation('qa.lms');
	return (
		<Group gap={6} wrap='nowrap' className={areaClasses.area} data-area={area}>
			<span className={classes.swatch} aria-hidden />
			<Text size={size} fw={500}>
				{t(LMS_AREA_META[area].labelKey)}
			</Text>
			{subItem && (
				<Text size={size} c='dimmed'>
					{t(`subItems.${subItem}`)}
				</Text>
			)}
		</Group>
	);
}
