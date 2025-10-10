// CampaignConfigurationTemperatureControl.tsx
import { Button, Group, Slider, Text } from '@mantine/core';
import { useCallback } from 'react';
import { IconAdjustments } from '@tabler/icons-react';
import { useCampaignFormContext } from '../../../campaignFormFunctions';
import SectionCard from '~/components/SectionCard';
import styles from './CampaignConfigurationTemperatureControl.module.css';

const CampaignConfigurationTemperatureControl: React.FC = () => {
	const form = useCampaignFormContext();

	const currentTemperature =
		form.values.agentConfig?.conversationConfig?.agent?.prompt?.temperature ??
		0.5;

	const handleTemperatureChange = useCallback(
		(value: number) => {
			form.setFieldValue(
				'agentConfig.conversationConfig.agent.prompt.temperature',
				value
			);
		},
		[form]
	);

	const handlePresetClick = useCallback(
		(temperature: number) => {
			handleTemperatureChange(temperature);
		},
		[handleTemperatureChange]
	);

	const isDeterministicActive = currentTemperature === 0;
	const isCreativeActive =
		currentTemperature >= 0.45 && currentTemperature <= 0.5;
	const isMoreCreativeActive = currentTemperature === 1;

	return (
		<SectionCard
			icon={IconAdjustments}
			title='Temperature Control'
			description='Controls the randomness of the AI responses. Lower values make responses more focused and deterministic.'
			className={styles.sectionCard}
			contentSpacing='lg'
		>
			<div className={styles.sliderContainer}>
				<Slider
					value={currentTemperature}
					onChange={handleTemperatureChange}
					min={0}
					max={1}
					step={0.05}
					size='md'
					marks={[
						{ value: 0, label: '0' },
						{ value: 0.5, label: '0.5' },
						{ value: 1, label: '1' },
					]}
					className={styles.slider}
				/>
			</div>

			<div>
				<Text size='xs' fw={500} mb='xs' c='dimmed'>
					Quick Presets
				</Text>
				<Group gap='xs'>
					<Button
						size='xs'
						variant={isDeterministicActive ? 'filled' : 'light'}
						onClick={() => handlePresetClick(0)}
						className={styles.presetButton}
					>
						Deterministic
					</Button>
					<Button
						size='xs'
						variant={isCreativeActive ? 'filled' : 'light'}
						onClick={() => handlePresetClick(0.5)}
						className={styles.presetButton}
					>
						Creative
					</Button>
					<Button
						size='xs'
						variant={isMoreCreativeActive ? 'filled' : 'light'}
						onClick={() => handlePresetClick(1)}
						className={styles.presetButton}
					>
						More Creative
					</Button>
				</Group>
			</div>

			<Text size='xs' c='dimmed'>
				Current value: {currentTemperature.toFixed(2)}
			</Text>
		</SectionCard>
	);
};

export default CampaignConfigurationTemperatureControl;
