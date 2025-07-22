import React, { useMemo } from "react";
import { SegmentedControl } from "@mantine/core";
import { useToolCategories } from "~/queries/toolCategoryQueries";
import useToolsStore from "~/stores/toolsStore";
import styles from "./ToolsCategories.module.css";

const ToolsCategories = () => {
  const { data: categories = [], isLoading, error } = useToolCategories();
  const selectedToolCategory = useToolsStore((s) => s.selectedToolCategory);
  const setToolsCategory = useToolsStore((s) => s.setToolsCategory);

  const segmentedData = useMemo(
    () =>
      categories.map((cat) => ({
        label: cat.name,
        value: String(cat.id),
      })),
    [categories]
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading categories</div>;
  if (!categories.length) return <div>No categories found</div>;

  return (
    <SegmentedControl
      data={segmentedData}
      value={selectedToolCategory ? String(selectedToolCategory.id) : ""}
      onChange={(value) => {
        const cat = categories.find((c) => String(c.id) === value) || null;
        setToolsCategory(cat, null); // rightComponent logic can be added as needed
      }}
      classNames={{
        root: styles.segmentedControl,
        label: styles.segment,
      }}
    />
  );
};

export default ToolsCategories;
