import React from 'react';
import { useTranslation } from 'react-i18next';
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
	const { t } = useTranslation('campaigns');
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
			label: t('scheduler.calculator.fields.totalRecords'),
			min: 0,
		},
		mode === 'resources'
			? {
					name: 'daysEstimation',
					label: t('scheduler.calculator.fields.daysPlanned'),
					min: 1,
				}
			: {
					name: 'totalAgents',
					label: t('scheduler.calculator.fields.agentsAllocated'),
					min: 1,
				},
	];

	const sliderFields: SliderFieldConfig[] = [
		{
			name: 'contactability',
			label: t('scheduler.calculator.fields.contactability'),
			min: 0,
			max: 100,
			unit: '%',
		},
		{
			name: 'effectiveness',
			label: t('scheduler.calculator.fields.effectiveness'),
			min: 0,
			max: 100,
			unit: '%',
		},
	];

	const ahtFields: FieldConfig[] = [
		{
			name: 'ahtEffective',
			label: t('scheduler.calculator.fields.ahtEffective'),
			min: 0,
		},
		{
			name: 'ahtNoEffective',
			label: t('scheduler.calculator.fields.ahtNoEffective'),
			min: 0,
		},
		{
			name: 'ahtNoContact',
			label: t('scheduler.calculator.fields.ahtNoContact'),
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
					<Text className={styles.title}>
						{t('scheduler.calculator.title')}
					</Text>
					<Text className={styles.description}>
						{t('scheduler.calculator.description')}
					</Text>
				</div>
				<AppSegmentedControl
					value={mode}
					onChange={handleModeChange}
					data={[
						{
							label: t('scheduler.calculator.mode.resources'),
							value: 'resources',
						},
						{ label: t('scheduler.calculator.mode.time'), value: 'time' },
					]}
					size='sm'
					fullWidth
				/>
			</header>{' '}
			<form className={styles.form} onSubmit={form.onSubmit(handleSubmit)}>
				<Stack gap='md'>
					<SimpleGrid cols={2}>{renderFields(mainFields)}</SimpleGrid>

					<div className={styles.section}>
						<Text className={styles.fieldsetTitle}>
							{t('scheduler.calculator.contactRates')}
						</Text>
						<SimpleGrid cols={2}>{renderSliderFields(sliderFields)}</SimpleGrid>
					</div>

					<div className={styles.section}>
						<Text className={styles.fieldsetTitle}>
							{t('scheduler.calculator.aht')}
						</Text>
						<SimpleGrid cols={2}>{renderFields(ahtFields)}</SimpleGrid>
					</div>

					<Group justify='flex-end' mt='xs'>
						<Button type='submit' size='md' className={styles.submit}>
							{t('scheduler.calculator.calculate')}
						</Button>
					</Group>
				</Stack>
			</form>
		</div>
	);
};

export default SchedulerForm;
