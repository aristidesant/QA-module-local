import React from "react";
import { Group, NumberInput, Slider, Text } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";

interface SliderWithInputProps {
  form: UseFormReturnType<any>;
  name: string;
  label: string;
  min: number;
  max: number;
  step: number;
  precision?: number;
}

export const SliderWithInput: React.FC<SliderWithInputProps> = ({
  form,
  name,
  label,
  min,
  max,
  step,
  precision = 0,
}) => {
  return (
    <Group gap="sm" align="center">
      <Text size="sm" fw={500}>
        {label}
      </Text>
      <Slider
        key={form.key(`${name}-slider`)}
        min={min}
        max={max}
        step={step}
        precision={precision}
        {...form.getInputProps(name, { type: "input" })}
        style={{ flex: 1 }}
      />
      <NumberInput
        key={form.key(`${name}-input`)}
        min={min}
        max={max}
        step={step}
        {...form.getInputProps(name, { type: "input" })}
      />
    </Group>
  );
};

export default SliderWithInput;
