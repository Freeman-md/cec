export const designSystem = {
  projectTitle: "Campus Event Ticketing dApp",
  themeName: "Cinematic Obsidian",
  origin: "Stitch MCP",
  typography: {
    displayFont: "Manrope",
    bodyFont: "Inter",
    displayLg: {
      size: "3.5rem",
      weight: 700,
    },
    headlineMd: {
      size: "1.75rem",
      weight: 600,
    },
    titleLg: {
      size: "1.375rem",
      weight: 500,
    },
    bodyMd: {
      size: "0.875rem",
      weight: 400,
    },
    labelMd: {
      size: "0.75rem",
      weight: 600,
    },
  },
  colors: {
    background: "#11131c",
    surface: "#11131c",
    surfaceContainerLow: "#191b24",
    surfaceContainer: "#1d1f29",
    surfaceContainerHigh: "#282933",
    surfaceContainerHighest: "#32343e",
    onSurface: "#e1e1ef",
    onSurfaceVariant: "#bbc9cf",
    primary: "#a8e8ff",
    primaryContainer: "#00d4ff",
    secondary: "#d1bcff",
    secondaryContainer: "#7000ff",
    tertiary: "#00fea2",
    outlineVariant: "#3c494e",
    error: "#ffb4ab",
    errorContainer: "#93000a",
  },
  componentRules: {
    noLineRule: "Avoid 1px section borders. Prefer tonal separation and surface shifts.",
    glassRule: "Use backdrop blur and translucent high-surface overlays for floating elements.",
    cards: "Favor modular cards with tonal layering, not bordered boxes.",
    badges: "Use low-glow dark badges with high-contrast status text.",
    buttons: "Primary actions should feel luminous and premium without becoming noisy.",
    inputs: "Inputs should read as inset surfaces with focus accents instead of boxy fields.",
  },
  motionAndDepth: {
    shadow: "0 20px 40px rgba(12, 14, 23, 0.5)",
    layoutIntent: "Editorial asymmetry with layered tonal surfaces.",
  },
  roleLayoutNotes: {
    header: "Global header should be dynamic based on connected wallet and detected role.",
    adminConsole: "No sidebar.",
    organizerStudio: "Minimal sidebar with only My Events and Create Event.",
  },
} as const;

export type DesignSystem = typeof designSystem;
