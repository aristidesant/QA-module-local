import { Badge, Progress, Text } from '@mantine/core';
import { IconGauge } from '@tabler/icons-react';
import RightSectionCard from '~/components/RightSectionCard';
import type AgentListObject from '~/models/AgentListObject';
import styles from './AgentTemperatureDisplay.module.css';

type AgentTemperatureDisplayProps = {
	agent: AgentListObject;
};

const getTemperatureLabel = (temp: number) => {
	if (temp === 0) return 'Deterministic';
	if (temp <= 0.35) return 'Focused';
	if (temp <= 0.65) return 'Balanced';
	if (temp < 1) return 'Creative';
	return 'Adventurous';
};

const getTemperatureColor = (temp: number) => {
	if (temp === 0) return 'blue';
	if (temp <= 0.35) return 'cyan';
	if (temp <= 0.65) return 'teal';
	if (temp < 1) return 'grape';
	return 'violet';
};

export const AgentTemperatureDisplay: React.FC<
	AgentTemperatureDisplayProps
> = ({ agent }) => {
	const temperature =
		agent?.config?.conversationConfig?.agent?.prompt?.temperature ?? 0;
	const cappedTemperature = Math.min(Math.max(temperature, 0), 1);
	const temperaturePercent = Math.round(cappedTemperature * 100);

	return (
		<RightSectionCard
			title='Temperature'
			description="Controls randomness in the agent's responses"
			icon={IconGauge}
			iconColor='var(--mantine-color-grape-6)'
			rightSection={
				<Badge
					variant='light'
					size='sm'
					color={getTemperatureColor(cappedTemperature)}
				>
					{temperaturePercent}%
				</Badge>
			}
		>
			<div className={styles.progressBlock}>
				<Progress
					value={temperaturePercent}
					size='md'
					radius='xl'
					color={getTemperatureColor(cappedTemperature)}
				/>
				<div className={styles.scale}>
					<span className={styles.scaleLabel}>Deterministic</span>
					<span className={styles.scaleMarker} />
					<span className={styles.scaleLabel}>Creative</span>
				</div>
			</div>
			<Text className={styles.caption}>
				{getTemperatureLabel(cappedTemperature)}
			</Text>
		</RightSectionCard>
	);
};

export default AgentTemperatureDisplay;
