import { Card, Group, Slider, Stack, Text, Box } from "@mantine/core";
import { useSchedulerFormContext } from "../SchedulerCard/schedulerFormProvider";

const CapacityCall: React.FC = () => {
  const form = useSchedulerFormContext();

  // Get value and onChange handler from form context
  const currentValue = form.values.humanEquivalent || 1;

  const handleChange = (val: number) =>
    form.setFieldValue("humanEquivalent", Number(val));
  return (
    <Card withBorder p="md" radius="md" bg="gray.0">
      <Stack gap="xs">
        <Group justify="space-between">
          <Box>
            <Text fw={500}>Capacity call</Text>
            <Text size="xs" c="dimmed">
              Define your dialing potential
            </Text>
          </Box>
          <Group gap="xs" justify="flex-end">
            <Text fw={500}>{currentValue}</Text>
            <Text size="xs" c="dimmed">
              Agents assigned
            </Text>
          </Group>
        </Group>
        <Slider
          color="blue"
          value={Number(currentValue || 0)}
          onChange={handleChange}
          min={1}
          max={100}
          styles={(theme) => ({
            track: {
              backgroundColor: theme.colors.gray[2],
              height: 8,
              borderRadius: 4,
            },
            thumb: {
              height: 16,
              width: 16,
              backgroundColor: theme.colors.blue[6],
              borderWidth: 0,
            },
            bar: {
              backgroundColor: theme.colors.blue[6],
            },
          })}
        />
      </Stack>
    </Card>
  );
};

export default CapacityCall;
