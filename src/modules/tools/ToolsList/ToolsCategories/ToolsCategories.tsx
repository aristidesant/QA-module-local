import { useMemo, useEffect } from "react";
import { Card, Text, Loader, UnstyledButton } from "@mantine/core";
// icons removed — tabs are minimal
import { useToolCategories } from "~/queries/toolCategoryQueries";
import useToolsStore from "~/stores/toolsStore";
import styles from "./ToolsCategories.module.css";

const ToolsCategories = () => {
  const { data: categories = [], isLoading, error } = useToolCategories();
  const selectedToolCategory = useToolsStore((s) => s.selectedToolCategory);
  const setToolsCategory = useToolsStore((s) => s.setToolsCategory);

  const items = useMemo(() => {
    return categories.map((cat) => ({
      id: String(cat.id),
      name: cat.name,
      // some backends include relational counts in _count; guard with any
      count: (cat as any)?._count?.tools as number | undefined,
    }));
  }, [categories]);

  // Select 'webhook' by default when categories load and nothing is selected
  useEffect(() => {
    if (!categories || categories.length === 0) return;
    if (selectedToolCategory) return; // user already has a selection

    const webhook = categories.find(
      (c) => String(c.name).toLowerCase() === "webhook"
    );
    if (webhook) setToolsCategory(webhook, null);
  }, [categories, selectedToolCategory, setToolsCategory]);

  if (isLoading)
    return (
      <div className={styles.loadingWrap}>
        <Loader size="sm" />
        <Text size="sm">Loading categories</Text>
      </div>
    );

  if (error)
    return (
      <div className={styles.errorWrap}>
        <Text color="red">Error loading categories</Text>
      </div>
    );

  if (!items.length)
    return (
      <Card withBorder radius="md" p="md" className={styles.emptyCard}>
        <div className={styles.emptyInner}>
          <div>
            <Text className={styles.emptyTitle}>No categories yet</Text>
            <Text size="xs" color="dimmed">
              Create a category to group your tools and speed up discovery.
            </Text>
          </div>
        </div>
      </Card>
    );

  return (
    <div className={styles.container}>
      <div
        className={styles.tabsWrap}
        role="tablist"
        aria-label="Tool categories"
      >
        {items.map((it) => {
          const active =
            Boolean(selectedToolCategory) &&
            String(selectedToolCategory?.id) === it.id;

          return (
            <UnstyledButton
              key={it.id}
              onClick={() => {
                const cat =
                  categories.find((c) => String(c.id) === it.id) || null;
                setToolsCategory(cat, null);
              }}
              className={`${styles.tab} ${active ? styles.tabActive : ""}`}
              role="tab"
              aria-selected={active}
              tabIndex={0}
            >
              <span className={styles.tabLabel}>{it.name}</span>
            </UnstyledButton>
          );
        })}
      </div>
    </div>
  );
};

export default ToolsCategories;
