import React from 'react';
import { Badge, Button, Group, Slider, Stack, Text } from '@mantine/core';
import type { EvaluationGroup, QaTestDetails } from './types';
import { WizardFooter, wizardKitStyles } from '../components/DemoWizardKit';
import styles from './DemoCreateQaTestPage.module.css';

function groupTotal(group: EvaluationGroup) {
	return group.items.reduce((sum, item) => sum + item.yesPoints, 0);
}

interface StepReviewProps {
	details: QaTestDetails;
	groups: EvaluationGroup[];
	passThreshold: number;
	onPassThresholdChange: (value: number) => void;
	onBack: () => void;
	onCancel: () => void;
	onSaveDraft: () => void;
	onPublish: () => void;
}

const StepReview: React.FC<StepReviewProps> = ({
	details,
	groups,
	passThreshold,
	onPassThresholdChange,
	onBack,
	onCancel,
	onSaveDraft,
	onPublish,
}) => {
	const grandTotal = groups.reduce((sum, g) => sum + groupTotal(g), 0);
	const isComplete = grandTotal === 100;
	const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0);

	return (
		<Stack gap='md'>
			<div className={wizardKitStyles.stepCard}>
				<Text fw={700} size='lg'>
					Review QA Test
				</Text>
				<Text size='sm' c='dimmed' mb='md'>
					Confirm all settings before publishing
				</Text>

				<div className={styles.reviewSection}>
					<Group justify='space-between' align='flex-start'>
						<Text fw={600}>Test Name</Text>
						<Text>{details.name}</Text>
					</Group>
					<Group justify='space-between' align='flex-start' mt='sm'>
						<Text fw={600}>QA Type</Text>
						<Badge color='green' variant='light'>
							{details.qaType.toLowerCase()}
						</Badge>
					</Group>
					<div>
						<Text fw={600} mt='sm'>
							Description
						</Text>
						<Text size='sm' c='dimmed'>
							{details.description || '—'}
						</Text>
					</div>
				</div>

				<div className={styles.reviewSection}>
					<Group justify='space-between' align='center'>
						<div>
							<Text fw={600}>Pass Threshold</Text>
							<Text size='xs' c='dimmed'>
								Score at or above this value is considered passed
							</Text>
						</div>
						<Text fw={700} size='xl' c='green'>
							{passThreshold}%
						</Text>
					</Group>
					<Slider
						mt='md'
						color='green'
						value={passThreshold}
						onChange={onPassThresholdChange}
						marks={[
							{ value: 0, label: '0%' },
							{ value: 50, label: '50%' },
							{ value: 100, label: '100%' },
						]}
					/>
				</div>

				<div className={styles.reviewSection}>
					<Group justify='space-between' mb='sm'>
						<Text fw={600}>Evaluation Criteria</Text>
						<Badge color='green' variant='light'>
							{groups.length} aspects
						</Badge>
					</Group>
					<Stack gap='sm'>
						{groups.map((group) => {
							const total = groupTotal(group);
							return (
								<div key={group.id}>
									<Text fw={600} size='sm'>
										{group.name}
									</Text>
									<Text size='xs' c='dimmed' mb={4}>
										{group.items.length} items
									</Text>
									<div
										className={
											isComplete ? styles.pointBarComplete : styles.pointBar
										}
									>
										{total} / {total} pts
									</div>
								</div>
							);
						})}
						{groups.length === 0 && (
							<Text size='sm' c='dimmed'>
								No evaluation criteria added yet ({totalItems} items).
							</Text>
						)}
					</Stack>
					<div className={styles.totalPointsPill}>
						Total Points:{' '}
						<Text component='span' fw={700} c={isComplete ? 'green' : 'red'}>
							{grandTotal}/100
						</Text>
					</div>
				</div>
			</div>

			<div className={wizardKitStyles.footerSpacer} />

			<WizardFooter>
				<Button variant='default' onClick={onBack}>
					Back
				</Button>
				<Group gap='sm'>
					<Button variant='default' onClick={onCancel}>
						Cancel
					</Button>
					<Button variant='light' color='green' onClick={onSaveDraft}>
						Save as Draft
					</Button>
					<Button color='green' disabled={!isComplete} onClick={onPublish}>
						Publish Test
					</Button>
				</Group>
			</WizardFooter>
		</Stack>
	);
};

export default StepReview;
