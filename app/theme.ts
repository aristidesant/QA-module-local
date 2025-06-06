import { Paper, type MantineThemeOverride } from "@mantine/core";

export const mantineTheme: MantineThemeOverride = {
  primaryColor: "blue",
  fontFamily:
    "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
  fontFamilyMonospace: "Monaco, Courier, monospace",
  headings: {
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    fontWeight: "600",
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    Card: {
      defaultProps: {
        shadow: "0",
        radius: "lg",
        p: "lg",
      },
    },
    Divider: {
      defaultProps: {
        variant: "dashed",
      },
    },
    Paper: {
      defaultProps: {
        shadow: "0",
        radius: "lg",
        p: "lg",
      },
    },
  },
};
