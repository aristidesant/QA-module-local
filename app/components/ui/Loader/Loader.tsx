import { Loader as MantineLoader, Text } from "@mantine/core";
import styles from "./Loader.module.css";

interface LoaderProps {
  text?: string;
}

export const Loader = ({ text = "Loading..." }: LoaderProps) => {
  return (
    <div className={styles.loaderContainer}>
      <Text className={styles.loadingText}>{text}</Text>
    </div>
  );
};
