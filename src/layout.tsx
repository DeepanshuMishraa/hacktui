import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import App from ".";
import { QueryProvider } from "./query-provider";
import { DialogProvider, themes } from "@opentui-ui/dialog/react";

export const RootLayout = () => {
  return (
    <>
      <QueryProvider>
        <DialogProvider size="medium" {...themes.minimal}>
          <App />
        </DialogProvider>
      </QueryProvider>
    </>
  );
};

const renderer = await createCliRenderer();
createRoot(renderer).render(<RootLayout />);
