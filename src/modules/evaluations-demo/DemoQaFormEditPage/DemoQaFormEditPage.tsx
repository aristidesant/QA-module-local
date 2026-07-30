import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Stack } from '@mantine/core';
import ContentContainer from '~/components/ContentContainer';
import StepEvaluationCriteria from '../DemoCreateQaTestPage/StepEvaluationCriteria';
import { DEMO_QA_FORMS } from '../DemoQaFormsListPage/mockQaForms';
import type { CriteriaMode, EvaluationGroup } from '../DemoCreateQaTestPage/types';

const DemoQaFormEditPage: React.FC = () => {
	const { formId } = useParams();
	const navigate = useNavigate();

	const form = useMemo(() => DEMO_QA_FORMS.find((f) => f.id === formId), [formId]);

	const [groups, setGroups] = useState<EvaluationGroup[]>(form?.groups || []);
	const [mode, setMode] = useState<CriteriaMode>(form?.groups && form.groups.length > 0 ? 'scratch' : null);

	if (!form) {
		return (
			<ContentContainer>
				<Stack align='center' justify='center' gap='lg' py='xl'>
					Form not found
				</Stack>
			</ContentContainer>
		);
	}

	const handleBack = () => {
		navigate('/role-preview/qa-forms');
	};

	const handleCancel = () => {
		navigate('/role-preview/qa-forms');
	};

	const handleSaveDraft = () => {
		// For demo purposes, just navigate back
		navigate('/role-preview/qa-forms');
	};

	const handleNext = () => {
		// For demo purposes, just navigate back after review
		navigate('/role-preview/qa-forms');
	};

	return (
		<ContentContainer contentWidth='full'>
			<StepEvaluationCriteria
				mode={mode}
				onModeChange={setMode}
				groups={groups}
				onChange={setGroups}
				onBack={handleBack}
				onCancel={handleCancel}
				onSaveDraft={handleSaveDraft}
				onNext={handleNext}
			/>
		</ContentContainer>
	);
};

export default DemoQaFormEditPage;
