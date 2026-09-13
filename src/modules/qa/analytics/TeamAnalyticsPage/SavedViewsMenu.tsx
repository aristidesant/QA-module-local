import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import {
	Button,
	Menu,
	Group,
	Text,
	Stack,
	Divider,
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
import { BUILT_IN_PRESETS, VIEW_PARAM, DEFAULT_VIEW } from '../constants';
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

	const allPresets: Array<{ id: string; name: string; isBuiltIn: boolean }> = [
		...BUILT_IN_PRESETS.map((p) => ({
			id: p.id,
			name: t(`presets.${p.id}`),
			isBuiltIn: true,
		})),
		...presets.map((p) => ({
			id: p.id,
			name: p.name,
			isBuiltIn: false,
		})),
	];

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
						{t('presets.label')}
					</Button>
				</Menu.Target>

				<Menu.Dropdown>
					<Stack gap={0}>
						{allPresets.length > 0 && (
							<>
								{allPresets.map((preset) => (
									<Menu.Item
										key={`${preset.isBuiltIn ? 'builtin' : 'custom'}-${preset.id}`}
										onClick={() => applyPreset(preset.id)}
										rightSection={
											!preset.isBuiltIn && (
												<Button
													size='xs'
													variant='subtle'
													onClick={(e) => {
														e.stopPropagation();
														deletePreset(preset.id);
													}}
													p={0}
													h='auto'
												>
													<IconTrash size={14} />
												</Button>
											)
										}
									>
										<Group justify='space-between' grow>
											<Text size='sm'>{preset.name}</Text>
										</Group>
									</Menu.Item>
								))}
								<Divider my='xs' />
							</>
						)}

						<Menu.Item onClick={() => setSaveModalOpen(true)}>
							<Group gap='xs'>
								<IconPlus size={16} />
								<Text size='sm'>{t('presets.save')}</Text>
							</Group>
						</Menu.Item>
					</Stack>
				</Menu.Dropdown>
			</Menu>

			<Modal
				opened={saveModalOpen}
				onClose={() => setSaveModalOpen(false)}
				title={t('presets.save')}
				size='sm'
			>
				<Stack gap='md'>
					<TextInput
						label={t('presets.name')}
						placeholder={t('presets.namePlaceholder')}
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
							{t('presets.save')}
						</Button>
					</Group>
				</Stack>
			</Modal>
		</>
	);
}
