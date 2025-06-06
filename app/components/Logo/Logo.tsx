import { Group, Text, Box, Image } from "@mantine/core";
import { IconBrain } from "@tabler/icons-react";
import styles from "./Logo.module.css";

interface LogoProps {
  animated?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "compact";
}

const Logo: React.FC<LogoProps> = ({
  animated = false,
  size = "lg",
  variant = "default",
}) => {
  return (
    <div className={styles.logo} data-testid="logo">
      <Image src="/images/logo-2.png" alt="Logo" className={styles.logoImage} />
      <Text className={styles.logoText}>
        Unified <span className={styles.logoAccent}>CXM</span>
      </Text>
    </div>
  );
};

export default Logo;
