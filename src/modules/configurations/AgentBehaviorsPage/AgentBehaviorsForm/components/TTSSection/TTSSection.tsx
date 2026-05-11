import { useEffect, useMemo, useRef, useState } from 'react';
import {
	Button,
	Group,
	Paper,
	Popover,
	Select,
	Slider,
	Stack,
	Switch,
	Text,
	Textarea,
	TextInput,
} from '@mantine/core';
import { IconInfoCircle, IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from '../../CampaignPredefinedFormProvider';
import {
	AUDIO_FORMATS,
	DEFAULT_TTS_MODEL_ID,
	EXPRESSIVE_TTS_MODEL_ID,
	TTS_MODELS,
	isExpressiveTtsModel,
} from '../../formConfig';
import styles from '../../CampaignPredefinedParamsForm.module.css';

const DEFAULT_SUGGESTED_AUDIO_TAGS = [
	'Confidently',
	'Warmly',
	'Excitedly',
	'Patiently',
	'Enthusiastically',
	'Seriously',
	'Chuckles',
	'Laughing',
	'Sighs',
];

const SuggestedAudioTagsEditor: React.FC = () => {
	const { form } = useFormContext();
	const { t } = useTranslation('campaign-predefined-params');
	const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
	const selectedTags = form.values.ttsSuggestedAudioTags;
	const didAutoOpenNewTagRef = useRef(false);

	const selectedTagKeys = useMemo(
		() =>
			new Set(
				selectedTags.map((tag) => tag.tag.trim().toLowerCase()).filter(Boolean)
			),
		[selectedTags]
	);

	const availableDefaultTags = DEFAULT_SUGGESTED_AUDIO_TAGS.filter(
		(tag) => !selectedTagKeys.has(tag.toLowerCase())
	);

	const openTagAtIndex = (index: number) => {
		setActiveTagIndex(index);
	};

	const addTag = (tag: string) => {
		const normalizedTag = tag.trim();
		if (!normalizedTag) {
			return;
		}

		const existingIndex = form.values.ttsSuggestedAudioTags.findIndex(
			(item) => item.tag.trim().toLowerCase() === normalizedTag.toLowerCase()
		);

		if (existingIndex >= 0) {
			openTagAtIndex(existingIndex);
			return;
		}

		const nextIndex = form.values.ttsSuggestedAudioTags.length;
		form.insertListItem('ttsSuggestedAudioTags', {
			tag: normalizedTag,
			description: '',
		});
		setActiveTagIndex(nextIndex);
		didAutoOpenNewTagRef.current = true;
	};

	const addBlankCustomTag = () => {
		const nextIndex = form.values.ttsSuggestedAudioTags.length;
		form.insertListItem('ttsSuggestedAudioTags', {
			tag: '',
			description: '',
		});
		setActiveTagIndex(nextIndex);
		didAutoOpenNewTagRef.current = true;
	};

	useEffect(() => {
		if (
			activeTagIndex !== null &&
			activeTagIndex >= form.values.ttsSuggestedAudioTags.length
		) {
			setActiveTagIndex(null);
		}
	}, [activeTagIndex, form.values.ttsSuggestedAudioTags.length]);

	useEffect(() => {
		if (
			didAutoOpenNewTagRef.current &&
			activeTagIndex !== null &&
			form.values.ttsSuggestedAudioTags[activeTagIndex]
		) {
			didAutoOpenNewTagRef.current = false;
		}
	}, [activeTagIndex, form.values.ttsSuggestedAudioTags]);

	return (
		<Stack gap='xs' className={styles.tagsEditor}>
			<Group justify='space-between' align='flex-start' wrap='nowrap'>
				<Stack gap={2} className={styles.tagsEditorHeader}>
					<Text size='sm' fw={600}>
						{t('form.tts.suggestedAudioTags.title')}
					</Text>
					<Text size='xs' c='dimmed'>
						{t('form.tts.suggestedAudioTags.helper')}
					</Text>
				</Stack>
				<Button
					variant='light'
					size='xs'
					leftSection={<IconPlus size={12} />}
					onClick={addBlankCustomTag}
				>
					{t('form.tts.suggestedAudioTags.add')}
				</Button>
			</Group>

			{selectedTags.length > 0 && (
				<Group gap='xs' wrap='wrap' className={styles.tagChipGroup}>
					{selectedTags.map((tagItem, index) => {
						const isOpen = activeTagIndex === index;
						const chipLabel =
							tagItem.tag.trim() || t('form.tts.suggestedAudioTags.untitled');

						return (
							<Popover
								key={index}
								opened={isOpen}
								onChange={(opened) => {
									if (!opened && activeTagIndex === index) {
										setActiveTagIndex(null);
									}
								}}
								width={360}
								position='bottom-start'
								withArrow
								shadow='md'
							>
								<Popover.Target>
									<Button
										type='button'
										variant={tagItem.tag.trim() ? 'filled' : 'light'}
										color='dark'
										size='xs'
										radius='xl'
										leftSection={
											!tagItem.tag.trim() ? <IconPlus size={12} /> : null
										}
										className={styles.tagChip}
										onClick={() => openTagAtIndex(index)}
									>
										{chipLabel}
									</Button>
								</Popover.Target>

								<Popover.Dropdown className={styles.tagPopover}>
									<Stack gap='xs'>
										<Text size='sm' fw={600}>
											{chipLabel}
										</Text>
										<TextInput
											label={t('form.tts.suggestedAudioTags.fields.tag.label')}
											placeholder={t(
												'form.tts.suggestedAudioTags.fields.tag.placeholder'
											)}
											size='sm'
											radius='md'
											{...form.getInputProps(
												`ttsSuggestedAudioTags.${index}.tag`
											)}
										/>
										<Textarea
											label={t(
												'form.tts.suggestedAudioTags.fields.description.label'
											)}
											placeholder={t(
												'form.tts.suggestedAudioTags.fields.description.placeholder'
											)}
											size='sm'
											minRows={4}
											radius='md'
											autosize
											{...form.getInputProps(
												`ttsSuggestedAudioTags.${index}.description`
											)}
										/>
										<Group justify='space-between' align='center'>
											<Button
												variant='subtle'
												color='red'
												size='xs'
												leftSection={<IconTrash size={12} />}
												onClick={() => {
													form.removeListItem('ttsSuggestedAudioTags', index);
													setActiveTagIndex(null);
												}}
											>
												{t('form.tts.suggestedAudioTags.remove')}
											</Button>
											<Button
												variant='filled'
												size='xs'
												onClick={() => setActiveTagIndex(null)}
											>
												{t('form.tts.suggestedAudioTags.done')}
											</Button>
										</Group>
									</Stack>
								</Popover.Dropdown>
							</Popover>
						);
					})}
				</Group>
			)}

			<Group gap='xs' wrap='wrap' className={styles.tagChipGroup}>
				{availableDefaultTags.map((tag) => (
					<Button
						key={tag}
						type='button'
						variant='default'
						size='xs'
						radius='xl'
						leftSection={<IconPlus size={12} />}
						className={styles.defaultTagChip}
						onClick={() => addTag(tag)}
					>
						{tag}
					</Button>
				))}
			</Group>

			<Text size='xs' c='dimmed'>
				{t('form.tts.suggestedAudioTags.clickHint')}
			</Text>
		</Stack>
	);
};

export const TTSSection: React.FC = () => {
	const { form } = useFormContext();
	const { t } = useTranslation('campaign-predefined-params');
	const lastNonExpressiveModelIdRef = useRef(
		form.values.ttsModelId === EXPRESSIVE_TTS_MODEL_ID
			? DEFAULT_TTS_MODEL_ID
			: form.values.ttsModelId
	);
	const isExpressiveModel = isExpressiveTtsModel(form.values.ttsModelId);

	useEffect(() => {
		if (!isExpressiveModel && form.values.ttsModelId) {
			lastNonExpressiveModelIdRef.current = form.values.ttsModelId;
		}
	}, [form.values.ttsModelId, isExpressiveModel]);

	useEffect(() => {
		if (form.values.ttsModelId === EXPRESSIVE_TTS_MODEL_ID) {
			if (!form.values.ttsExpressiveMode) {
				form.setFieldValue('ttsExpressiveMode', true);
			}
			return;
		}

		if (form.values.ttsExpressiveMode) {
			form.setFieldValue('ttsExpressiveMode', false);
		}
	}, [form, form.values.ttsExpressiveMode, form.values.ttsModelId]);

	const handleTtsModelChange = (value: string | null) => {
		const nextModelId = value || DEFAULT_TTS_MODEL_ID;

		if (nextModelId === EXPRESSIVE_TTS_MODEL_ID) {
			form.setFieldValue('ttsModelId', nextModelId);
			form.setFieldValue('ttsExpressiveMode', true);
			return;
		}

		lastNonExpressiveModelIdRef.current = nextModelId;
		form.setFieldValue('ttsModelId', nextModelId);
		form.setFieldValue('ttsExpressiveMode', false);
	};

	const handleExpressiveModeChange = (checked: boolean) => {
		if (checked) {
			form.setFieldValue('ttsExpressiveMode', true);
			form.setFieldValue('ttsModelId', EXPRESSIVE_TTS_MODEL_ID);
			return;
		}

		form.setFieldValue('ttsExpressiveMode', false);
		form.setFieldValue(
			'ttsModelId',
			lastNonExpressiveModelIdRef.current || DEFAULT_TTS_MODEL_ID
		);
	};

	return (
		<Stack className={styles.sectionStack}>
			<div className={styles.fieldRow}>
				<Select
					label={t('form.tts.model.label')}
					placeholder={t('form.tts.model.placeholder')}
					required
					data={TTS_MODELS}
					value={form.values.ttsModelId}
					onChange={handleTtsModelChange}
					searchable
				/>
				<Select
					label={t('form.tts.outputAudioFormat.label')}
					placeholder={t('form.common.selectFormatPlaceholder')}
					required
					data={AUDIO_FORMATS}
					{...form.getInputProps('ttsAgentOutputAudioFormat')}
				/>
			</div>

			<Paper
				withBorder
				radius='md'
				p='sm'
				className={styles.expressiveModeCard}
			>
				<Group justify='space-between' align='flex-start' wrap='nowrap'>
					<Stack gap={2} className={styles.expressiveModeText}>
						<Text size='sm' fw={600}>
							{t('form.tts.expressiveMode.label')}
						</Text>
						<Text size='xs' c='dimmed'>
							{t('form.tts.expressiveMode.helper')}
						</Text>
					</Stack>
					<Switch
						checked={form.values.ttsExpressiveMode}
						onChange={(event) =>
							handleExpressiveModeChange(event.currentTarget.checked)
						}
					/>
				</Group>
			</Paper>

			{isExpressiveModel && (
				<Paper withBorder radius='md' p='sm' className={styles.helperCard}>
					<Group gap='sm' align='flex-start' wrap='nowrap'>
						<IconInfoCircle size={18} className={styles.helperIcon} />
						<Text size='sm'>{t('form.tts.voiceSettingsLocked.helper')}</Text>
					</Group>
				</Paper>
			)}

			{isExpressiveModel && <SuggestedAudioTagsEditor />}

			<div className={styles.sliderContainer}>
				<div className={styles.sliderLabel}>
					<label>{t('form.tts.speed.label')}</label>
					<span className={styles.sliderValue}>
						{form.values.ttsSpeed.toFixed(2)}
					</span>
				</div>
				<Slider
					min={0.25}
					max={4.0}
					step={0.01}
					value={form.values.ttsSpeed}
					onChange={(value) => form.setFieldValue('ttsSpeed', value)}
					disabled={isExpressiveModel}
					marks={[
						{ value: 0.25, label: '0.25' },
						{ value: 2.0, label: '2.0' },
						{ value: 4.0, label: '4.0' },
					]}
				/>
				<Text size='xs' c='dimmed'>
					{t('form.tts.speed.helper')}
				</Text>
			</div>

			<div className={styles.sliderContainer}>
				<div className={styles.sliderLabel}>
					<label>{t('form.tts.streamingLatency.label')}</label>
					<span className={styles.sliderValue}>
						{form.values.ttsOptimizeStreamingLatency}
					</span>
				</div>
				<Slider
					min={0}
					max={4}
					step={1}
					value={form.values.ttsOptimizeStreamingLatency}
					onChange={(value) =>
						form.setFieldValue('ttsOptimizeStreamingLatency', value)
					}
					marks={[
						{ value: 0, label: '0' },
						{ value: 2, label: '2' },
						{ value: 4, label: '4' },
					]}
				/>
				<Text size='xs' c='dimmed'>
					{t('form.tts.streamingLatency.helper')}
				</Text>
			</div>

			<div className={styles.sliderContainer}>
				<div className={styles.sliderLabel}>
					<label>{t('form.tts.stability.label')}</label>
					<span className={styles.sliderValue}>
						{form.values.ttsStability.toFixed(2)}
					</span>
				</div>
				<Slider
					min={0}
					max={1}
					step={0.01}
					value={form.values.ttsStability}
					onChange={(value) => form.setFieldValue('ttsStability', value)}
					disabled={isExpressiveModel}
					marks={[
						{ value: 0, label: '0' },
						{ value: 0.5, label: '0.5' },
						{ value: 1, label: '1' },
					]}
				/>
				<Text size='xs' c='dimmed'>
					{t('form.tts.stability.helper')}
				</Text>
			</div>

			<div className={styles.sliderContainer}>
				<div className={styles.sliderLabel}>
					<label>{t('form.tts.similarityBoost.label')}</label>
					<span className={styles.sliderValue}>
						{form.values.ttsSimilarityBoost.toFixed(2)}
					</span>
				</div>
				<Slider
					min={0}
					max={1}
					step={0.01}
					value={form.values.ttsSimilarityBoost}
					onChange={(value) => form.setFieldValue('ttsSimilarityBoost', value)}
					disabled={isExpressiveModel}
					marks={[
						{ value: 0, label: '0' },
						{ value: 0.5, label: '0.5' },
						{ value: 1, label: '1' },
					]}
				/>
				<Text size='xs' c='dimmed'>
					{t('form.tts.similarityBoost.helper')}
				</Text>
			</div>
		</Stack>
	);
};

export default TTSSection;
