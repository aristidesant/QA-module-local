import styles from "./Loader.module.css";

interface LoaderProps {
  text?: string;
}

export const Loader = ({ text = "Loading" }: LoaderProps) => (
  <div className={styles.loaderContainer}>
    <div className={styles.loaderWrapper}>
      <div className={styles.spinnerContainer}>
        <div className={styles.outerRing}></div>
        <div className={styles.innerRing}></div>
        <div className={styles.centerPulse}></div>
      </div>
      <div className={styles.textContainer}>
        <span className={styles.loadingText}>{text}</span>
        <div className={styles.dots}>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      </div>
    </div>
  </div>
);
