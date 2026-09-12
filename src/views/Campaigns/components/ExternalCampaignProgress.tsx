import { Group, Card, Text, Stepper as MantineStepper } from '@mantine/core';

interface ExternalCampaignProgressProps {
  currentStep: 'form' | 'upload' | 'evaluation';
}

export default function ExternalCampaignProgress({
  currentStep
}: ExternalCampaignProgressProps) {
  // Define steps
  const steps = [
    { id: 'form', label: 'Campaign Details', description: 'Setup' },
    { id: 'upload', label: 'Upload Files', description: 'Optional', optional: true },
    { id: 'evaluation', label: 'Select Evaluations', description: 'Final step' },
  ];

  const visibleSteps = steps;

  const stepOrder = {
    form: 0,
    upload: 1,
    evaluation: 2,
  };

  const currentStepIndex = stepOrder[currentStep];

  return (
    <Card shadow="sm" padding="lg" radius="lg" withBorder style={{ backgroundColor: '#f9f9f9', marginBottom: '24px' }}>
      <MantineStepper active={currentStepIndex} allowNextStepsSelect={false}>
        {visibleSteps.map((step) => (
          <MantineStepper.Step
            key={step.id}
            label={step.label}
            description={step.optional ? 'Optional' : undefined}
          />
        ))}
      </MantineStepper>
      <Group justify="center" mt="md">
        <Text size="xs" c="dimmed">
          Step {currentStepIndex + 1} of {visibleSteps.length}
        </Text>
      </Group>
    </Card>
  );
}
