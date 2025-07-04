import { MultiSelect } from "@mantine/core";
import { useMemo } from "react";

interface StatusFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
  data: string[];
}

export function StatusFilter({ value, onChange, data }: StatusFilterProps) {
  const statusOptions = useMemo(() => {
    const uniqueStatuses = Array.from(new Set(data)).filter(Boolean);
    return uniqueStatuses.map((status) => ({
      value: status.toLowerCase(),
      label:
        status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " "),
    }));
  }, [data]);

  return (
    <MultiSelect
      placeholder="Filter by status"
      value={value}
      onChange={onChange}
      data={statusOptions}
      size="sm"
      clearable
      searchable
      style={{ minWidth: "200px" }}
    />
  );
}
