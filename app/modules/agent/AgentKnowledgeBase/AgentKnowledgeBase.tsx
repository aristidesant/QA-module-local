import React from "react";
import {
  IconFileText,
  IconWorld,
  IconApi,
  IconPlus,
} from "@tabler/icons-react";
import styles from "./AgentKnowledgeBase.module.css";
import SectionCard from "~/components/SectionCard";
import { ThemeIcon } from "@mantine/core";

interface KnowledgeBaseItem {
  id: string;
  type: "file" | "url" | "api";
  label: string;
  path?: string;
}

export const AgentKnowledgeBase: React.FC = () => {
  const knowledgeBaseItems: KnowledgeBaseItem[] = [
    {
      id: "1",
      type: "file",
      label: "Customer support guides",
    },
    {
      id: "2",
      type: "file",
      label: "Product or service manuals",
    },
    {
      id: "3",
      type: "url",
      label: "www.examplebank.com/faqs",
    },
    {
      id: "4",
      type: "api",
      label: "Real-time card product data",
      path: "/api.examplebank.com/v1/cards",
    },
    {
      id: "5",
      type: "api",
      label: "Customer profile",
      path: "/api.examplebank.com/v1/cards",
    },
  ];

  return (
    <SectionCard
      title="Knowledge Base"
      description="Provide your agent with essential information to handle questions accurately and confidently during calls."
    >
      <div className={styles.container}>
        {knowledgeBaseItems.map((item) => (
          <div key={item.id} className={styles.item}>
            <div className={styles.itemContent}>
              <ThemeIcon variant="subtle" color="gray">
                {item.type === "file" && <IconFileText size={20} />}
                {item.type === "url" && <IconWorld size={20} />}
                {item.type === "api" && <IconApi size={20} />}
              </ThemeIcon>
              <div>
                <div className={styles.label}>{item.label}</div>
                {item.path && <div className={styles.path}>{item.path}</div>}
              </div>
            </div>
          </div>
        ))}
        <button type="button" className={styles.addButton}>
          <IconPlus size={20} className={styles.plusIcon} />
          <span>Add Knowledge Base</span>
        </button>
      </div>
    </SectionCard>
  );
};
