import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	ActionIcon,
	Button,
	Group,
	NumberInput,
	Select,
	Stack,
	Text,
	TextInput,
} from '@mantine/core';
import { IconPlus, IconRuler2, IconTrash } from '@tabler/icons-react';
import AppDrawer from '~/components/AppDrawer';
import { SCALE_TYPES } from '../constants';
import { nextId } from '../helpers';
import type { ScaleBand, ScaleType, ScoreScale } from '../types';

interface ScoreScaleDrawerProps {
	opened: boolean;
	onClose: () => void;
	scale?: ScoreScale;
	onSave: (scale: ScoreScale) => void;
}

const emptyScale = (): ScoreScale => ({
	id: nextId('scale'),
	name: '',
	type: 'QA',
	bands: [
		{ label: 'Low', min: 0 },
		{ label: 'Fair', min: 60 },
		{ label: 'Excellent', min: 80 },
	],
	updatedAt: '',
});

/** Bands must start at 0 and climb strictly, so each one has a clear floor. */
const bandsValid = (bands: ScaleBand[]) =>
	bands.length >= 2 &&
	bands[0].min === 0 &&
	bands.every((band) => band.label.trim() !== '') &&
	bands.every((band, index) => index === 0 || band.min > bands[index - 1].min);

/** Create or edit one named score scale and its ascending bands. */
export const ScoreScaleDrawer: React.FC<ScoreScaleDrawerProps> = ({
	opened,
	onClose,
	scale,
	onSave,
}) => {
	const { t } = useTranslation('qa.globalConfig');
	const [draft, setDraft] = useState<ScoreScale>(scale ?? emptyScale());

	useEffect(() => {
		if (opened) setDraft(scale ?? emptyScale());
	}, [opened, scale]);

	const setBand = (index: number, patch: Partial<ScaleBand>) =>
		setDraft({
			...draft,
			bands: draft.bands.map((band, i) =>
				i === index ? { ...band, ...patch } : band
			),
		});

	const invalid = draft.name.trim() === '' || !bandsValid(draft.bands);

	return (
		<AppDrawer
			opened={opened}
			onClose={onClose}
			size='md'
			icon={<IconRuler2 size={20} />}
			title={t(
				scale
					? 'scoreScales.drawer.editTitle'
					: 'scoreScales.drawer.createTitle'
			)}
			description={t('scoreScales.drawer.description')}
		>
			<Stack gap='md'>
				<TextInput
					label={t('scoreScales.columns.name')}
					value={draft.name}
					onChange={(event) =>
						setDraft({ ...draft, name: event.currentTarget.value })
					}
					required
				/>
				<Select
					label={t('scoreScales.columns.type')}
					data={SCALE_TYPES.map((type) => ({
						value: type,
						label: t(`scoreScales.types.${type}`),
					}))}
					value={draft.type}
					onChange={(value) =>
						value && setDraft({ ...draft, type: value as ScaleType })
					}
					allowDeselect={false}
					comboboxProps={{ withinPortal: true }}
				/>

				<Stack gap='xs'>
					<Group justify='space-between'>
						<Text size='sm' fw={500}>
							{t('scoreScales.drawer.bands')}
						</Text>
						<Button
							variant='subtle'
							size='compact-sm'
							leftSection={<IconPlus size={14} />}
							onClick={() =>
								setDraft({
									...draft,
									bands: [
										...draft.bands,
										{
											label: '',
											min: (draft.bands[draft.bands.length - 1]?.min ?? 0) + 10,
										},
									],
								})
							}
						>
							{t('scoreScales.drawer.addBand')}
						</Button>
					</Group>
					<Text size='xs' c='dimmed'>
						{t('scoreScales.drawer.bandsHelp')}
					</Text>
					{draft.bands.map((band, index) => (
						<Group key={index} gap='xs' wrap='nowrap' align='flex-end'>
							<TextInput
								label={index === 0 ? t('scoreScales.drawer.label') : undefined}
								value={band.label}
								onChange={(event) =>
									setBand(index, { label: event.currentTarget.value })
								}
								flex={1}
							/>
							<NumberInput
								label={index === 0 ? t('scoreScales.drawer.from') : undefined}
								value={band.min}
								min={0}
								max={100}
								disabled={index === 0}
								onChange={(value) =>
									setBand(index, { min: Number(value) || 0 })
								}
								w={110}
							/>
							<ActionIcon
								variant='subtle'
								color='red'
								aria-label={t('common.actions.delete')}
								disabled={index === 0 || draft.bands.length <= 2}
								onClick={() =>
									setDraft({
										...draft,
										bands: draft.bands.filter((_, i) => i !== index),
									})
								}
							>
								<IconTrash size={16} />
							</ActionIcon>
						</Group>
					))}
					{!bandsValid(draft.bands) && (
						<Text size='xs' c='red'>
							{t('scoreScales.drawer.invalidBands')}
						</Text>
					)}
				</Stack>

				<Group justify='flex-end' mt='sm'>
					<Button variant='default' onClick={onClose}>
						{t('common.cancel')}
					</Button>
					<Button
						disabled={invalid}
						onClick={() => {
							onSave(draft);
							onClose();
						}}
					>
						{t('common.save')}
					</Button>
				</Group>
			</Stack>
		</AppDrawer>
	);
};

export default ScoreScaleDrawer;
