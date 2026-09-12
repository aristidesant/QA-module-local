import { ReactNode } from 'react';
import { Container, Stack, Group, Button, Card, Text, Title, ActionIcon, Stepper as MantineStepper } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

export interface StepConfig {
  id: string;
  title: string;
  description: string;
  optional?: boolean;
  skipped?: boolean;
  component: ReactNode;
}

interface ExternalCampaignStepperProps {
  steps: StepConfig[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onBack: () => void;
  onNext: () => boolean; // Returns true if step validation passes
  onComplete: () => void;
  canNavigateToPrevious?: boolean;
  showBackToChoice?: boolean;
  onBackToChoice?: () => void;
}

export default function ExternalCampaignStepper({
  steps,
  currentStepIndex,
  onStepChange,
  onBack,
  onNext,
  onComplete,
  canNavigateToPrevious = true,
  showBackToChoice = false,
  onBackToChoice,
}: ExternalCampaignStepperProps) {
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const handleNext = () => {
    const isValid = onNext();
    if (isValid) {
      if (isLastStep) {
        onComplete();
      } else {
        onStepChange(currentStepIndex + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (canNavigateToPrevious && !isFirstStep) {
      onStepChange(currentStepIndex - 1);
    } else {
      onBack();
    }
  };

  // Filter out skipped steps for display
  const visibleSteps = steps.filter(step => !step.skipped);
  const visibleCurrentIndex = visibleSteps.findIndex(step => step.id === currentStep.id);

  return (
    <Container size="xl" px="lg" style={{ paddingTop: '48px', paddingBottom: '32px' }}>
      <Stack gap="lg">
        {/* Header */}
        <Group align="flex-start" gap="lg">
          <div>
            <Group gap="xs" mb="xs">
              <ActionIcon
                variant="subtle"
                onClick={showBackToChoice && onBackToChoice ? onBackToChoice : handlePrevious}
                title={showBackToChoice && onBackToChoice ? "Back to choice" : "Back"}
              >
                <IconArrowLeft size={18} />
              </ActionIcon>
              <div style={{ flex: 1 }}>
                <Title order={2} style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                  {currentStep.title}
                </Title>
                <Text size="sm" c="dimmed">
                  {currentStep.description}
                  {currentStep.optional && (
                    <Text component="span" size="sm" c="dimmed" style={{ marginLeft: '8px', fontStyle: 'italic' }}>
                      • Optional
                    </Text>
                  )}
                </Text>
              </div>
            </Group>
          </div>
        </Group>

        {/* Stepper */}
        <Card shadow="sm" padding="lg" radius="lg" withBorder style={{ backgroundColor: '#f9f9f9' }}>
          <MantineStepper active={visibleCurrentIndex} allowNextStepsSelect={false}>
            {visibleSteps.map((step) => (
              <MantineStepper.Step
                key={step.id}
                label={step.title}
                description={step.optional ? 'Optional' : undefined}
                onClick={() => canNavigateToPrevious && onStepChange(steps.findIndex(s => s.id === step.id))}
                style={{ cursor: canNavigateToPrevious ? 'pointer' : 'default' }}
              />
            ))}
          </MantineStepper>
        </Card>

        {/* Content */}
        <div>
          {currentStep.component}
        </div>

        {/* Navigation Buttons */}
        <Group justify="flex-end" gap="xs" style={{ paddingTop: '24px', borderTop: '1px solid #e9ecef' }}>
          <Button
            variant="default"
            onClick={handlePrevious}
            disabled={isFirstStep && !showBackToChoice}
          >
            Back
          </Button>
          <Button
            color="brand"
            onClick={handleNext}
          >
            {isLastStep ? 'Complete' : 'Next'}
          </Button>
        </Group>

        {/* Progress Indicator */}
        <div style={{ textAlign: 'center', paddingTop: '12px' }}>
          <Text size="xs" c="dimmed">
            Step {visibleCurrentIndex + 1} of {visibleSteps.length}
          </Text>
        </div>
      </Stack>
    </Container>
  );
}
