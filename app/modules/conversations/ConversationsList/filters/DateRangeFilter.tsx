import { DateInput } from "@mantine/dates";
import { Group, Text } from "@mantine/core";
import { useState } from "react";

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
}

export function DateRangeFilter({ onDateRangeChange }: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleStartDateChange = (value: string | null) => {
    const dateValue = value ? new Date(value) : null;
    setStartDate(dateValue);
    onDateRangeChange(dateValue, endDate);
  };

  const handleEndDateChange = (value: string | null) => {
    const dateValue = value ? new Date(value) : null;
    setEndDate(dateValue);
    onDateRangeChange(startDate, dateValue);
  };

  return (
    <Group gap="xs">
      <Text size="xs" c="dimmed">
        Date Range:
      </Text>
      <DateInput
        placeholder="Start date"
        value={startDate}
        onChange={handleStartDateChange}
        size="sm"
        clearable
        style={{ width: "140px" }}
        maxDate={endDate || undefined}
      />
      <Text size="xs" c="dimmed">
        to
      </Text>
      <DateInput
        placeholder="End date"
        value={endDate}
        onChange={handleEndDateChange}
        size="sm"
        clearable
        style={{ width: "140px" }}
        minDate={startDate || undefined}
      />
    </Group>
  );
}
