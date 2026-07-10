import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function FixtureApp(): React.JSX.Element {
  const publicOrigin = import.meta.env.VITE_PUBLIC_API_ORIGIN as string;
  const mistakenlyPublicToken = import.meta.env.VITE_INTERNAL_API_TOKEN as string | undefined;

  return (
    <main>
      <p className="eyebrow">Deterministic fixture</p>
      <h1>Preview-to-production gate</h1>
      <p data-testid="api-origin">API origin: {publicOrigin}</p>
      <p data-testid="fixture-status">
        Bundle fixture: {mistakenlyPublicToken ? "unsafe input detected" : "public inputs only"}
      </p>
      <span hidden data-intentional-fixture-leak={mistakenlyPublicToken} />
    </main>
  );
}

const container = document.querySelector<HTMLDivElement>("#root");
if (!container) throw new Error("Missing #root fixture mount point");
createRoot(container).render(<FixtureApp />);
