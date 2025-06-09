// app/theme.ts

import { createTheme, DEFAULT_THEME } from "@mantine/core";
import type { MantineColorsTuple } from "@mantine/core";

// Custom color palettes
const deepBlue: MantineColorsTuple = [
  "#eaf2fb",
  "#d0e0f6",
  "#a3c1e8",
  "#729fd8",
  "#4a7fc9",
  "#2e68be",
  "#1d5ab7",
  "#0e4aa4",
  "#0a3c85",
  "#052a5e",
];

const teal: MantineColorsTuple = [
  "#e6fcf7",
  "#c3f7ec",
  "#8eeada",
  "#5edbc7",
  "#36cdb7",
  "#1dbca7",
  "#13a393",
  "#10847a",
  "#0e6a65",
  "#094d47",
];

const accentPurple: MantineColorsTuple = [
  "#f5eafe",
  "#e5d0fa",
  "#cba3f2",
  "#b072e8",
  "#984ae0",
  "#8832db",
  "#7b23d7",
  "#6712c1",
  "#570fa2",
  "#3d086e",
];

const grayModern: MantineColorsTuple = [
  "#f8fafc",
  "#f1f5f9",
  "#e2e8f0",
  "#cbd5e1",
  "#94a3b8",
  "#64748b",
  "#475569",
  "#334155",
  "#1e293b",
  "#0f172a",
];

// Theme configuration
const theme = createTheme({
  primaryColor: "deepBlue",
  colors: {
    deepBlue,
    accentPurple,
    grayModern,
    // Use Mantine's default colors for fallback
    ...DEFAULT_THEME.colors,
  },
  primaryShade: 6,
  defaultRadius: "md",
  fontFamily: `'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif`,
  fontFamilyMonospace: `'JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace`,
  headings: {
    fontFamily: `'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif`,
    fontWeight: "700",
    sizes: {
      h1: {
        fontSize: "2.8rem",
        fontWeight: "800",
        lineHeight: "1.1",
      },
      h2: {
        fontSize: "2.2rem",
        fontWeight: "700",
        lineHeight: "1.15",
      },
      h3: {
        fontSize: "1.7rem",
        fontWeight: "600",
        lineHeight: "1.2",
      },
      h4: {
        fontSize: "1.3rem",
        fontWeight: "600",
        lineHeight: "1.25",
      },
      h5: {
        fontSize: "1.1rem",
        fontWeight: "500",
        lineHeight: "1.3",
      },
      h6: {
        fontSize: "1rem",
        fontWeight: "500",
        lineHeight: "1.35",
      },
    },
  },
  fontSizes: {
    xs: "0.82rem",
    sm: "0.92rem",
    md: "1.05rem",
    lg: "1.18rem",
    xl: "1.35rem",
  },
  lineHeights: {
    xs: "1.5",
    sm: "1.6",
    md: "1.7",
    lg: "1.8",
    xl: "2",
  },
  spacing: {
    xs: "0.5rem",
    sm: "0.9rem",
    md: "1.5rem",
    lg: "2.2rem",
    xl: "3rem",
  },
  shadows: {
    xs: "0 1px 3px 0 rgba(16, 30, 54, 0.04)",
    sm: "0 2px 8px 0 rgba(16, 30, 54, 0.06)",
    md: "0 4px 16px 0 rgba(16, 30, 54, 0.10), 0 1.5px 4px 0 rgba(16, 30, 54, 0.08)",
    lg: "0 8px 32px 0 rgba(16, 30, 54, 0.13), 0 2px 8px 0 rgba(16, 30, 54, 0.10)",
    xl: "0 16px 48px 0 rgba(16, 30, 54, 0.16), 0 4px 16px 0 rgba(16, 30, 54, 0.13)",
  },
  radius: {
    xs: "6px",
    sm: "10px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  components: {
    Button: {
      defaultProps: {
        radius: "lg",
        size: "md",
        fw: 600,
        variant: "filled",
        color: "deepBlue",
        style: {
          background:
            "linear-gradient(90deg, var(--mantine-color-deepBlue-6) 0%, var(--mantine-color-teal-5) 100%)",
          color: "var(--mantine-color-white)",
          boxShadow:
            "0 4px 16px 0 rgba(16, 30, 54, 0.10), 0 1.5px 4px 0 rgba(16, 30, 54, 0.08)",
          borderRadius: "var(--mantine-radius-lg)",
          transition: "background 0.3s, box-shadow 0.2s, transform 0.15s",
        },
      },
    },
    Card: {
      defaultProps: {
        radius: "lg",
        shadow: "lg",
        padding: "lg",
        style: {
          border: "1px solid var(--mantine-color-grayModern-2)",
          background:
            "linear-gradient(135deg, var(--mantine-color-white) 80%, var(--mantine-color-grayModern-0) 100%)",
          transition: "box-shadow 0.2s, border-color 0.2s",
        },
      },
    },
    Paper: {
      defaultProps: {
        radius: "md",
        shadow: "sm",
        withBorder: true,
        style: {
          border: "1px solid var(--mantine-color-grayModern-1)",
          background: "var(--mantine-color-white)",
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
        size: "md",
        withAsterisk: false,
        styles: {
          input: {
            borderRadius: "var(--mantine-radius-md)",
            border: "1.5px solid var(--mantine-color-grayModern-2)",
            background: "var(--mantine-color-grayModern-0)",
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: "0 1px 3px 0 rgba(16, 30, 54, 0.04)",
          },
          label: {
            fontWeight: 600,
            color: "var(--mantine-color-deepBlue-7)",
            marginBottom: "0.3rem",
          },
        },
      },
    },
    Textarea: {
      defaultProps: {
        radius: "md",
        size: "md",
        autosize: true,
        minRows: 3,
        styles: {
          input: {
            borderRadius: "var(--mantine-radius-md)",
            border: "1.5px solid var(--mantine-color-grayModern-2)",
            background: "var(--mantine-color-grayModern-0)",
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: "0 1px 3px 0 rgba(16, 30, 54, 0.04)",
          },
          label: {
            fontWeight: 600,
            color: "var(--mantine-color-deepBlue-7)",
            marginBottom: "0.3rem",
          },
        },
      },
    },
    Select: {
      defaultProps: {
        radius: "md",
        size: "md",
        styles: {
          input: {
            borderRadius: "var(--mantine-radius-md)",
            border: "1.5px solid var(--mantine-color-grayModern-2)",
            background: "var(--mantine-color-grayModern-0)",
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: "0 1px 3px 0 rgba(16, 30, 54, 0.04)",
          },
          label: {
            fontWeight: 600,
            color: "var(--mantine-color-deepBlue-7)",
            marginBottom: "0.3rem",
          },
        },
      },
    },
    Input: {
      defaultProps: {
        radius: "md",
        size: "md",
        styles: {
          input: {
            borderRadius: "var(--mantine-radius-md)",
            border: "1.5px solid var(--mantine-color-grayModern-2)",
            background: "var(--mantine-color-grayModern-0)",
            transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: "0 1px 3px 0 rgba(16, 30, 54, 0.04)",
          },
        },
      },
    },
    Tabs: {
      defaultProps: {
        radius: "md",
        color: "deepBlue",
        variant: "outline",
        styles: {
          tab: {
            fontWeight: 600,
            borderRadius: "var(--mantine-radius-md)",
            color: "var(--mantine-color-deepBlue-7)",
            "&[data-active]": {
              background: "var(--mantine-color-deepBlue-0)",
              color: "var(--mantine-color-deepBlue-7)",
              borderColor: "var(--mantine-color-deepBlue-5)",
            },
          },
          list: {
            gap: "0.5rem",
          },
        },
      },
    },
    Breadcrumbs: {
      defaultProps: {
        separator: "/",
        styles: {
          root: {
            color: "var(--mantine-color-grayModern-5)",
            fontWeight: 500,
            fontSize: "1rem",
          },
          separator: {
            color: "var(--mantine-color-grayModern-4)",
            margin: "0 0.5rem",
          },
        },
      },
    },
    Container: {
      defaultProps: {
        size: "lg",
        style: {
          padding: "var(--mantine-spacing-lg)",
          borderRadius: "var(--mantine-radius-lg)",
          background: "var(--mantine-color-grayModern-0)",
          boxShadow: "var(--mantine-shadow-sm)",
        },
      },
    },
    Modal: {
      defaultProps: {
        radius: "lg",
        shadow: "xl",
        centered: true,
        overlayProps: {
          blur: 2,
          color: "var(--mantine-color-grayModern-9)",
          opacity: 0.15,
        },
        styles: {
          content: {
            borderRadius: "var(--mantine-radius-lg)",
            boxShadow: "var(--mantine-shadow-xl)",
            background: "var(--mantine-color-white)",
          },
        },
      },
    },
    Notification: {
      defaultProps: {
        radius: "md",
        color: "deepBlue",
        styles: {
          root: {
            background: "var(--mantine-color-grayModern-0)",
            border: "1px solid var(--mantine-color-deepBlue-2)",
            boxShadow: "var(--mantine-shadow-xs)",
          },
          icon: {
            color: "var(--mantine-color-deepBlue-6)",
          },
        },
      },
    },
    Avatar: {
      defaultProps: {
        radius: "xl",
        size: "md",
        color: "deepBlue",
      },
    },
    Tooltip: {
      defaultProps: {
        radius: "md",
        color: "deepBlue",
        withArrow: true,
        styles: {
          tooltip: {
            background: "var(--mantine-color-deepBlue-7)",
            color: "var(--mantine-color-white)",
            fontWeight: 500,
            fontSize: "0.95rem",
            borderRadius: "var(--mantine-radius-md)",
            boxShadow: "var(--mantine-shadow-xs)",
          },
        },
      },
    },
    Divider: {
      defaultProps: {
        color: "grayModern.2",
        size: "sm",
        style: {
          borderColor: "var(--mantine-color-grayModern-2)",
        },
      },
    },
    Loader: {
      defaultProps: {
        color: "deepBlue",
        size: "md",
        type: "dots",
      },
    },
    Checkbox: {
      defaultProps: {
        radius: "md",
        color: "deepBlue",
        size: "md",
        styles: {
          input: {
            borderColor: "var(--mantine-color-grayModern-3)",
            background: "var(--mantine-color-grayModern-0)",
            "&:checked": {
              background: "var(--mantine-color-deepBlue-6)",
              borderColor: "var(--mantine-color-deepBlue-6)",
            },
          },
        },
      },
    },
    Radio: {
      defaultProps: {
        radius: "md",
        color: "deepBlue",
        size: "md",
        styles: {
          radio: {
            borderColor: "var(--mantine-color-grayModern-3)",
            background: "var(--mantine-color-grayModern-0)",
            "&:checked": {
              background: "var(--mantine-color-deepBlue-6)",
              borderColor: "var(--mantine-color-deepBlue-6)",
            },
          },
        },
      },
    },
    Switch: {
      defaultProps: {
        radius: "md",
        color: "deepBlue",
        size: "md",
        styles: {
          track: {
            background: "var(--mantine-color-grayModern-2)",
          },
          thumb: {
            background: "var(--mantine-color-deepBlue-6)",
          },
        },
      },
    },
    Menu: {
      defaultProps: {
        radius: "md",
        shadow: "md",
        styles: {
          dropdown: {
            background: "var(--mantine-color-white)",
            border: "1px solid var(--mantine-color-grayModern-2)",
            boxShadow: "var(--mantine-shadow-md)",
            borderRadius: "var(--mantine-radius-md)",
          },
          item: {
            borderRadius: "var(--mantine-radius-sm)",
            "&[data-hovered]": {
              background: "var(--mantine-color-grayModern-1)",
            },
          },
        },
      },
    },
    ScrollArea: {
      defaultProps: {
        styles: {
          scrollbar: {
            background: "var(--mantine-color-grayModern-1)",
          },
          thumb: {
            background: "var(--mantine-color-deepBlue-3)",
          },
        },
      },
    },
  },
  // transitions is not a valid Mantine theme key, so it was removed.
  other: {
    accentColor: "accentPurple",
    secondaryColor: "teal",
    spacingScale: [0, 4, 8, 12, 16, 24, 32, 40, 48, 64],
    shadowSystem: [
      "0 1px 3px 0 rgba(16, 30, 54, 0.04)",
      "0 2px 8px 0 rgba(16, 30, 54, 0.06)",
      "0 4px 16px 0 rgba(16, 30, 54, 0.10), 0 1.5px 4px 0 rgba(16, 30, 54, 0.08)",
      "0 8px 32px 0 rgba(16, 30, 54, 0.13), 0 2px 8px 0 rgba(16, 30, 54, 0.10)",
      "0 16px 48px 0 rgba(16, 30, 54, 0.16), 0 4px 16px 0 rgba(16, 30, 54, 0.13)",
    ],
  },
});

export default theme;
