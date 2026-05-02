import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import App from ".";

export const RootLayout = () => {
  return (
    <>
      <App />
    </>
  );
};

const renderer = await createCliRenderer();
createRoot(renderer).render(<RootLayout />);
