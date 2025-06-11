import { Text, Image } from "@mantine/core";
import styles from "./Logo.module.css";

interface LogoProps {
  animated?: boolean;
  compact?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "compact";
}

const Logo: React.FC<LogoProps> = ({
  animated = false,
  size = "lg",
  variant = "default",
  compact = false,
}) => {
  return (
    <div className={styles.logo} data-testid="logo">
      <Image
        src={
          compact ? "/images/logoonblack-small-nt.png" : "/images/logo-2.png"
        }
        alt="Logo"
        className={styles.logoImage}
      />
      {!compact && (
        <Text className={styles.logoText}>
          Unified <span className={styles.logoAccent}>CXM</span>
        </Text>
      )}
    </div>
  );
};

export default Logo;
