import React from "react";
import { Paper, Title, Grid } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
import styles from "./PromptGeneratorContainer.module.css";
import { useForm } from "@mantine/form"; // Corrected import
import { PromptInputForm } from "../PromptInputForm"; // Added import
import { PromptOutputDisplay } from "../PromptOutputDisplay"; // Added import

export const PromptGeneratorContainer: React.FC = () => {
  const form = useForm({
    initialValues: {
      agentName: "",
      agentRole: "",
      agentTone: "",
      companyProductInfo: "",
      targetAudience: "",
      generatedPrompt: "",
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const generated = `✨ Agent Name: ${values.agentName}

📝 Agent Role:
${values.agentRole}

🎨 Agent Tone:
${values.agentTone}

🏢 Company/Product Information:
${values.companyProductInfo}

🎯 Target Audience:
${values.targetAudience}`;
    form.setFieldValue("generatedPrompt", generated);
    console.log(values);
  };

  return (
    <div className={styles.wrapper}>
      <Paper
        className={styles.container}
        shadow="lg" // Increased shadow for more depth
        p="xl" // Increased padding
        radius="lg" // Increased radius for softer corners
        withBorder
      >
        <Title order={1} className={styles.title} ta="center" mb="xl">
          <IconSparkles size={36} style={{ marginRight: 8 }} />
          AI Prompt Studio
        </Title>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Grid gutter="xl">
            {" "}
            {/* Increased gutter for more space between columns */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <PromptInputForm form={form} />
            </Grid.Col>
            <Grid.Col
              span={{ base: 12, md: 6 }}
              className={styles.outputColumn}
            >
              <PromptOutputDisplay form={form} />
            </Grid.Col>
          </Grid>
        </form>
      </Paper>
    </div>
  );
};
