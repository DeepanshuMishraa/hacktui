import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import App from ".";
import { QueryProvider } from "./query-provider";

export const RootLayout = () => {
  return (
    <>
      <QueryProvider>
        <App />
      </QueryProvider>
    </>
  );
};

const renderer = await createCliRenderer();
createRoot(renderer).render(<RootLayout />);
