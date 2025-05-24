import { Group, Text, Box } from "@mantine/core";
import { IconBrain } from "@tabler/icons-react";
import styles from "./Logo.module.css";

interface LogoProps {
  animated?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "compact";
}

const Logo: React.FC<LogoProps> = ({
  animated = false,
  size = "md",
  variant = "default",
}) => {
  const sizeMap = {
    sm: { icon: 16, boxSize: 28 },
    md: { icon: 20, boxSize: 36 },
    lg: { icon: 24, boxSize: 44 },
  };

  const { icon: iconSize, boxSize } = sizeMap[size];

  return (
    <Group
      className={`${styles.logo} ${styles[size]} ${styles[variant]}`}
      gap={size === "sm" ? 8 : size === "lg" ? 12 : 10}
      align="center"
      wrap="nowrap"
    >
      <Box
        className={`${styles.logoIcon} ${
          animated ? styles.logoIconAnimated : ""
        }`}
        style={{ width: boxSize, height: boxSize }}
      >
        <div className={styles.iconWrapper}>
          <IconBrain size={iconSize} stroke={1.5} />
        </div>
      </Box>
      {variant === "default" && (
        <div className={styles.logoText}>
          <Text
            c="green.7"
            component="span"
            className={`${styles.logoMain} ${styles[size]}`}
          >
            Newtech AI
          </Text>
          <Text
            component="span"
            className={`${styles.logoTagline} ${styles[size]}`}
          >
            Intelligent Solutions
          </Text>
        </div>
      )}
    </Group>
  );
};

export default Logo;
