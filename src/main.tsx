import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { HiringApp } from "./app/HiringApp";
import { DemoApp } from "./demo/DemoApp";
import "./styles/global.css";

function Root() {
  const [view, setView] = useState<"app" | "docs">("app");
  return view === "app" ? (
    <HiringApp onOpenDocs={() => setView("docs")} />
  ) : (
    <DemoApp onBack={() => setView("app")} />
  );
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");

createRoot(root).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
