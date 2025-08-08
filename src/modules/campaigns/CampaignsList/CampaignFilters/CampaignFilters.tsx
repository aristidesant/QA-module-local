import {
  Group,
  TextInput,
  Select,
  ActionIcon,
  CloseButton,
} from "@mantine/core";
import { IconSearch, IconAdjustments } from "@tabler/icons-react";
import styles from "./CampaignFilters.module.css";

interface CampaignFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
}

export default function CampaignFilters({
  searchValue,
  onSearchChange,
  sortBy,
  onSortChange,
}: CampaignFiltersProps) {
  const sortOptions = [
    { value: "createdAt", label: "Creation date" },
    { value: "name", label: "Name" },
    { value: "status", label: "Status" },
    { value: "lastActivity", label: "Last activity" },
  ];

  return (
    <div className={styles.filtersContainer}>
      <Group justify="space-between" wrap="wrap" gap="md">
        <Group gap="sm">
          <TextInput
            placeholder="Search campaigns..."
            value={searchValue}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            rightSection={
              searchValue ? (
                <CloseButton
                  size="sm"
                  onClick={() => onSearchChange("")}
                  variant="subtle"
                />
              ) : (
                <IconSearch size={16} className={styles.searchIcon} />
              )
            }
            className={styles.searchInput}
          />
        </Group>

        <Group gap="sm" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <span className={styles.sortLabel}>Sort by:</span>
            <Select
              value={sortBy}
              onChange={(value) => onSortChange(value || "createdAt")}
              data={sortOptions}
              className={styles.sortSelect}
              size="sm"
              variant="filled"
              comboboxProps={{ withinPortal: true }}
            />
          </Group>

          <ActionIcon
            variant="subtle"
            color="gray"
            className={styles.filtersButton}
            title="Advanced filters"
          >
            <IconAdjustments size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </div>
  );
}
