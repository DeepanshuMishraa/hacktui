import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import App from ".";
import { QueryProvider } from "./query-provider";
import { DialogProvider, themes } from "@opentui-ui/dialog/react";
import { ThemeProvider, useTheme } from "./theme";

const ThemedDialogProvider = ({ children }: { children: React.ReactNode }) => {
  const { mode } = useTheme();

  return (
    <DialogProvider
      size="medium"
      {...themes.minimal}
      dialogOptions={{
        style: {
          backgroundColor: mode === "dark" ? "#262626" : "#ffffff",
          border: false,
          padding: 1,
        },
      }}
    >
      {children}
    </DialogProvider>
  );
};

export const RootLayout = () => {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ThemedDialogProvider>
          <App />
        </ThemedDialogProvider>
      </QueryProvider>
    </ThemeProvider>
  );
};

const renderer = await createCliRenderer();
createRoot(renderer).render(<RootLayout />);
