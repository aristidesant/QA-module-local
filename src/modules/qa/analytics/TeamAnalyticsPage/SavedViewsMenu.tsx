import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import {
	ActionIcon,
	Button,
	Menu,
	Group,
	Stack,
	Modal,
	TextInput,
} from '@mantine/core';
import {
	IconChevronDown,
	IconBookmark,
	IconPlus,
	IconTrash,
} from '@tabler/icons-react';
import { useTeamAnalyticsStore } from '~/stores/qa/teamAnalyticsStore';
import { VIEW_PARAM, DEFAULT_VIEW } from '../constants';
import type { TeamAnalyticsView } from '../types';

export default function SavedViewsMenu() {
	const { t } = useTranslation('qa.teamAnalytics');
	const location = useLocation();
	const params = new URLSearchParams(location.search);
	const currentView =
		(params.get(VIEW_PARAM) as TeamAnalyticsView) || DEFAULT_VIEW;

	const { presets, savePreset, deletePreset, applyPreset } =
		useTeamAnalyticsStore();
	const [saveModalOpen, setSaveModalOpen] = useState(false);
	const [newPresetName, setNewPresetName] = useState('');

	const handleSavePreset = () => {
		if (newPresetName.trim()) {
			savePreset(newPresetName.trim(), currentView);
			setNewPresetName('');
			setSaveModalOpen(false);
		}
	};

	// The store seeds the built-in presets, so both lists come from the same slice.
	const builtInPresets = useMemo(
		() =>
			presets
				.filter((p) => p.builtIn)
				.map((p) => ({ id: p.id, name: t(`presets.builtInNames.${p.id}`) })),
		[presets, t]
	);
	const customPresets = useMemo(
		() =>
			presets
				.filter((p) => !p.builtIn)
				.map((p) => ({ id: p.id, name: p.name })),
		[presets]
	);

	return (
		<>
			<Menu withArrow>
				<Menu.Target>
					<Button
						rightSection={<IconChevronDown size={14} />}
						variant='light'
						size='sm'
						leftSection={<IconBookmark size={16} />}
					>
						{t('presets.button')}
					</Button>
				</Menu.Target>

				<Menu.Dropdown>
					<Menu.Label>{t('presets.builtIn')}</Menu.Label>
					{builtInPresets.map((preset) => (
						<Menu.Item
							key={`builtin-${preset.id}`}
							onClick={() => applyPreset(preset.id)}
						>
							{preset.name}
						</Menu.Item>
					))}

					<Menu.Label>{t('presets.mine')}</Menu.Label>
					{customPresets.length === 0 ? (
						<Menu.Item disabled>{t('presets.empty')}</Menu.Item>
					) : (
						customPresets.map((preset) => (
							// component="div": the row carries its own delete button, and a
							// button may not be nested inside Menu.Item's default <button>.
							<Menu.Item
								key={`custom-${preset.id}`}
								component='div'
								onClick={() => applyPreset(preset.id)}
								rightSection={
									<ActionIcon
										size='sm'
										variant='subtle'
										color='red'
										aria-label={t('presets.delete')}
										onClick={(e) => {
											e.stopPropagation();
											deletePreset(preset.id);
										}}
									>
										<IconTrash size={14} />
									</ActionIcon>
								}
							>
								{preset.name}
							</Menu.Item>
						))
					)}

					<Menu.Divider />

					<Menu.Item
						leftSection={<IconPlus size={16} />}
						onClick={() => setSaveModalOpen(true)}
					>
						{t('presets.save')}
					</Menu.Item>
				</Menu.Dropdown>
			</Menu>

			<Modal
				opened={saveModalOpen}
				onClose={() => setSaveModalOpen(false)}
				title={t('presets.modal.title')}
				size='sm'
			>
				<Stack gap='md'>
					<TextInput
						label={t('presets.modal.name')}
						placeholder={t('presets.modal.namePlaceholder')}
						description={t('presets.modal.hint')}
						value={newPresetName}
						onChange={(e) => setNewPresetName(e.currentTarget.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') handleSavePreset();
						}}
						autoFocus
					/>
					<Group justify='flex-end' gap='xs'>
						<Button variant='subtle' onClick={() => setSaveModalOpen(false)}>
							{t('common.cancel')}
						</Button>
						<Button onClick={handleSavePreset} disabled={!newPresetName.trim()}>
							{t('presets.modal.submit')}
						</Button>
					</Group>
				</Stack>
			</Modal>
		</>
	);
}
