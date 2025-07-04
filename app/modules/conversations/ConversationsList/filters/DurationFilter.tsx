import { NumberInput, Group, Text } from "@mantine/core";
import { useState } from "react";

interface DurationFilterProps {
  onDurationRangeChange: (
    minDuration: number | null,
    maxDuration: number | null
  ) => void;
}

export function DurationFilter({ onDurationRangeChange }: DurationFilterProps) {
  const [minDuration, setMinDuration] = useState<number | null>(null);
  const [maxDuration, setMaxDuration] = useState<number | null>(null);

  const handleMinDurationChange = (value: string | number) => {
    const numValue =
      typeof value === "string" ? parseInt(value) || null : value;
    setMinDuration(numValue);
    onDurationRangeChange(numValue, maxDuration);
  };

  const handleMaxDurationChange = (value: string | number) => {
    const numValue =
      typeof value === "string" ? parseInt(value) || null : value;
    setMaxDuration(numValue);
    onDurationRangeChange(minDuration, numValue);
  };

  return (
    <Group gap="xs">
      <Text size="xs" c="dimmed">
        Duration (seconds):
      </Text>
      <NumberInput
        placeholder="Min"
        value={minDuration ?? ""}
        onChange={handleMinDurationChange}
        size="sm"
        style={{ width: "80px" }}
        min={0}
      />
      <Text size="xs" c="dimmed">
        to
      </Text>
      <NumberInput
        placeholder="Max"
        value={maxDuration ?? ""}
        onChange={handleMaxDurationChange}
        size="sm"
        style={{ width: "80px" }}
        min={0}
      />
    </Group>
  );
}
