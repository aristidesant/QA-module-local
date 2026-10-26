import { Tooltip } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { LmsFormat } from '~/models/qa';
import { LMS_FORMAT_META } from '../constants';

interface FormatIconProps {
	format: LmsFormat;
	size?: number;
}

/** Format as an icon with a tooltip; the label is spoken, not printed. */
export function FormatIcon({ format, size = 16 }: FormatIconProps) {
	const { t } = useTranslation('qa.lms');
	const meta = LMS_FORMAT_META[format];
	const Icon = meta.icon;
	return (
		<Tooltip label={t(meta.labelKey)} withArrow>
			<Icon
				size={size}
				color='var(--mantine-color-dimmed)'
				aria-label={t(meta.labelKey)}
			/>
		</Tooltip>
	);
}
