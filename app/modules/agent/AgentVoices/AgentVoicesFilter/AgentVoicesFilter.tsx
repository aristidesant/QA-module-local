import React, { useState } from "react";
import styles from "./AgentVoicesFilter.module.css";
import { Button, Collapse } from "@mantine/core";
import {
  IconFilter,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { FormTextInput } from "~/components/ui/FormTextInput";
import { FormSelect } from "~/components/ui/FormSelect";
import {
  voicesGenders,
  voicesStatuses,
  voicesAges,
} from "~/config/voicesFilters";

export interface AgentVoicesFilterValues {
  name: string;
  gender: string;
  language: string;
  status: string;
  age: string;
  accent: string;
}

export const AgentVoicesFilter: React.FC<{
  filters: AgentVoicesFilterValues;
  onChange: (filters: AgentVoicesFilterValues) => void;
  initiallyOpen?: boolean;
}> = ({ filters, onChange, initiallyOpen = false }) => {
  const [filtersVisible, setFiltersVisible] = useState(initiallyOpen);
  const handleTextChange = (
    key: keyof AgentVoicesFilterValues,
    value: string
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const handleSelectChange = (
    key: keyof AgentVoicesFilterValues,
    value: string | null
  ) => {
    onChange({ ...filters, [key]: value || "" });
  };

  return (
    <div className={styles.filterContainer}>
      <Button
        variant="light"
        leftSection={<IconFilter size={16} />}
        rightSection={
          filtersVisible ? (
            <IconChevronUp size={16} />
          ) : (
            <IconChevronDown size={16} />
          )
        }
        onClick={() => setFiltersVisible((v: boolean) => !v)}
        className={styles.filterToggle}
      >
        Filters
      </Button>
      <Collapse in={filtersVisible}>
        <div className={styles.filtersGroup}>
          <FormTextInput
            label="Name"
            placeholder="Filter by name"
            value={filters.name}
            onChange={(e) => handleTextChange("name", e.target.value)}
          />
          <FormSelect
            label="Gender"
            placeholder="Filter by gender"
            value={filters.gender}
            onChange={(value) => handleSelectChange("gender", value)}
            data={voicesGenders.map((gender) => ({
              value: gender,
              label: gender.charAt(0) + gender.slice(1).toLowerCase(),
            }))}
            clearable
          />
          <FormTextInput
            label="Language"
            placeholder="Filter by language"
            value={filters.language}
            onChange={(e) => handleTextChange("language", e.target.value)}
          />
          <FormSelect
            label="Status"
            placeholder="Filter by status"
            value={filters.status}
            onChange={(value) => handleSelectChange("status", value)}
            data={voicesStatuses.map((status) => ({
              value: status,
              label: status.charAt(0) + status.slice(1).toLowerCase(),
            }))}
            clearable
          />
          <FormSelect
            label="Age"
            placeholder="Filter by age"
            value={filters.age}
            onChange={(value) => handleSelectChange("age", value)}
            data={voicesAges.map((age) => ({
              value: age,
              label: age
                .split(" ")
                .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
                .join(" "),
            }))}
            clearable
          />
          <FormTextInput
            label="Accent"
            placeholder="Filter by accent"
            value={filters.accent}
            onChange={(e) => handleTextChange("accent", e.target.value)}
          />
        </div>
      </Collapse>
    </div>
  );
};
