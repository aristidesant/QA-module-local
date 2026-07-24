import { Badge, Button, Code, Collapse, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { CapturedDataValue } from '~/models/backoffice/BackofficeCaseModel';
import classes from './CapturedDataList.module.css';

interface CapturedDataListProps {
	data?: Record<string, CapturedDataValue>;
}

type Entry = [string, CapturedDataValue];

// Backend sends the literal string "NA" for null/undefined/missing/empty values.
const isNotAvailable = (value: CapturedDataValue): boolean =>
	value === 'NA' ||
	value === null ||
	value === undefined ||
	(typeof value === 'string' && value.trim() === '');

const isPlainObject = (value: CapturedDataValue): boolean =>
	typeof value === 'object' && value !== null;

// snake_case / camelCase / kebab-case -> "Title Case". Keys are dynamic
// (backend-driven), so labels are humanized instead of translated.
const humanizeKey = (key: string): string =>
	key
		.replace(/[_-]+/g, ' ')
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/\s+/g, ' ')
		.trim()
		.replace(/\b\w/g, (char) => char.toUpperCase());

const CapturedDataList = ({ data }: CapturedDataListProps) => {
	const { t } = useTranslation('backoffice-cases');
	const [showNA, { toggle }] = useDisclosure(false);

	const entries: Entry[] = data ? Object.entries(data) : [];

	if (entries.length === 0) {
		return (
			<Text size='sm' c='dimmed'>
				{t('capturedData.empty')}
			</Text>
		);
	}

	const withData = entries.filter(([, value]) => !isNotAvailable(value));
	const naEntries = entries.filter(([, value]) => isNotAvailable(value));

	const renderTile = ([key, value]: Entry) => {
		const isBlock = isPlainObject(value);
		const na = isNotAvailable(value);

		let content;
		if (na) {
			content = (
				<Text size='sm' c='dimmed'>
					{t('common.notAvailable')}
				</Text>
			);
		} else if (isBlock) {
			content = (
				<Code block className={classes.jsonValue}>
					{JSON.stringify(value, null, 2)}
				</Code>
			);
		} else if (typeof value === 'boolean') {
			content = (
				<Badge color={value ? 'green' : 'gray'} variant='light' size='sm'>
					{value ? t('common.yes') : t('common.no')}
				</Badge>
			);
		} else {
			content = (
				<Text size='sm' fw={600} className={classes.tileValue}>
					{String(value)}
				</Text>
			);
		}

		return (
			<div
				key={key}
				className={`${classes.tile} ${isBlock ? classes.tileBlock : ''} ${
					na ? classes.tileMuted : ''
				}`}
			>
				<Text className={classes.tileLabel}>{humanizeKey(key)}</Text>
				{content}
			</div>
		);
	};

	return (
		<div>
			<div className={classes.grid}>{withData.map(renderTile)}</div>

			{naEntries.length > 0 && (
				<>
					<Collapse expanded={showNA}>
						<div className={`${classes.grid} ${classes.naGrid}`}>
							{naEntries.map(renderTile)}
						</div>
					</Collapse>

					<div className={classes.toggleRow}>
						<Button
							variant='subtle'
							size='xs'
							color='gray'
							onClick={toggle}
							rightSection={
								showNA ? (
									<IconChevronUp size={14} />
								) : (
									<IconChevronDown size={14} />
								)
							}
						>
							{showNA
								? t('capturedData.showLess')
								: t('capturedData.showMore', { count: naEntries.length })}
						</Button>
					</div>
				</>
			)}
		</div>
	);
};

export default CapturedDataList;
