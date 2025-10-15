import React from 'react';
import {
	Button,
	Group,
	NumberInput,
	SimpleGrid,
	Stack,
	Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { EstimationCalculationFormData } from '~/models/EstimationCalculationModels';
import { useSchedulerCalculatorStore } from '~/stores/schedulerCalculatorStore';
import AppSegmentedControl from '~/components/ui/AppSegmentedControl';
import styles from '../SchedulerCalculator.module.css';

type FormFieldKey = keyof EstimationCalculationFormData;

type FieldConfig = {
	name: FormFieldKey;
	label: string;
	min?: number;
	max?: number;
};

type SliderFieldConfig = {
	name: FormFieldKey;
	label: string;
	min: number;
	max: number;
	unit?: string;
};

const initialFormValues: EstimationCalculationFormData = {
	totalRecords: '',
	contactability: '30',
	effectiveness: '40',
	ahtEffective: '',
	ahtNoEffective: '',
	ahtNoContact: '',
	daysEstimation: '',
	totalAgents: '',
	totalTries: '',
	contactabilityByWaves: {
		wave1: '',
		wave2: '',
		wave3: '',
	},
	wavesStatistics: {
		wave1: {
			totalContacted: '',
			totalEffectiveContact: '',
			totalNoEffectiveContact: '',
			totalNoContact: '',
			triesOverNoContact: '',
			totalTime: '',
		},
		wave2: {
			totalContacted: '',
			totalEffectiveContact: '',
			totalNoEffectiveContact: '',
			totalNoContact: '',
			triesOverNoContact: '',
			totalTime: '',
		},
		wave3: {
			totalContacted: '',
			totalEffectiveContact: '',
			totalNoEffectiveContact: '',
			totalNoContact: '',
			triesOverNoContact: '',
			totalTime: '',
		},
	},
	totalMinutes: '',
	operationalMinutes: '',
	operationalHours: '',
	totalTeamHoursByDay: '',
};

const SchedulerForm: React.FC = () => {
	const { mode, setMode, setFormValues, calculate } =
		useSchedulerCalculatorStore();

	const form = useForm<EstimationCalculationFormData>({
		initialValues: initialFormValues,
	});

	const handleSubmit = (formValues: EstimationCalculationFormData) => {
		setFormValues(formValues);
		calculate();
	};

	const handleModeChange = (value: string) => {
		setMode(value as any);
	};

	const mainFields: FieldConfig[] = [
		{
			name: 'totalRecords',
			label: 'Total records',
			min: 0,
		},
		mode === 'resources'
			? {
					name: 'daysEstimation',
					label: 'Days planned',
					min: 1,
				}
			: {
					name: 'totalAgents',
					label: 'Agents allocated',
					min: 1,
				},
	];

	const sliderFields: SliderFieldConfig[] = [
		{
			name: 'contactability',
			label: 'Contactability',
			min: 0,
			max: 100,
			unit: '%',
		},
		{
			name: 'effectiveness',
			label: 'Effectiveness',
			min: 0,
			max: 100,
			unit: '%',
		},
	];

	const ahtFields: FieldConfig[] = [
		{
			name: 'ahtEffective',
			label: 'AHT effective contact',
			min: 0,
		},
		{
			name: 'ahtNoEffective',
			label: 'AHT no effective contact',
			min: 0,
		},
		{
			name: 'ahtNoContact',
			label: 'AHT no contact',
			min: 0,
		},
	];

	const renderFields = (fields: FieldConfig[]) =>
		fields.map(({ name, label, min, max }) => (
			<NumberInput
				key={name}
				size='sm'
				radius='md'
				label={label}
				min={min}
				max={max}
				hideControls
				className={styles.input}
				styles={{
					label: { fontSize: '13px', fontWeight: 600 },
				}}
				{...form.getInputProps(name)}
			/>
		));

	const renderSliderFields = (fields: SliderFieldConfig[]) =>
		fields.map(({ name, label, min, max, unit }) => (
			<NumberInput
				key={name}
				size='sm'
				radius='md'
				label={label}
				min={min}
				max={max}
				suffix={unit}
				hideControls
				className={styles.input}
				styles={{
					label: { fontSize: '13px', fontWeight: 600 },
				}}
				{...form.getInputProps(name)}
			/>
		));

	return (
		<div className={styles.formCard}>
			<header className={styles.header}>
				<div className={styles.headerContent}>
					<Text className={styles.title}>Scheduler calculator</Text>
					<Text className={styles.description}>
						Define the campaign parameters and project staffing or delivery time
						with confidence.
					</Text>
				</div>
				<AppSegmentedControl
					value={mode}
					onChange={handleModeChange}
					data={[
						{ label: 'Resources', value: 'resources' },
						{ label: 'Time', value: 'time' },
					]}
					size='sm'
					fullWidth
				/>
			</header>{' '}
			<form className={styles.form} onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='md'>
					<SimpleGrid cols={2}>{renderFields(mainFields)}</SimpleGrid>

					<div className={styles.section}>
						<Text className={styles.fieldsetTitle}>Contact rates</Text>
						<SimpleGrid cols={2}>{renderSliderFields(sliderFields)}</SimpleGrid>
					</div>

					<div className={styles.section}>
						<Text className={styles.fieldsetTitle}>
							Average handling time (minutes)
						</Text>
						<SimpleGrid cols={2}>{renderFields(ahtFields)}</SimpleGrid>
					</div>

					<Group justify='flex-end' mt='xs'>
						<Button type='submit' size='md' className={styles.submit}>
							Calculate projection
						</Button>
					</Group>
				</Stack>
			</form>
		</div>
	);
};

export default SchedulerForm;
