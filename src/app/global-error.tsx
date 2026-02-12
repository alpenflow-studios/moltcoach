"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body style={{ background: "#09090b", color: "#fafafa", fontFamily: "system-ui", padding: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Something went wrong</h1>
        <pre style={{ background: "#1a1a2e", padding: "1rem", borderRadius: "8px", overflow: "auto", fontSize: "0.875rem", color: "#f87171" }}>
          {error.message}
        </pre>
        <pre style={{ background: "#1a1a2e", padding: "1rem", borderRadius: "8px", overflow: "auto", fontSize: "0.75rem", color: "#a1a1aa", marginTop: "0.5rem" }}>
          {error.stack}
        </pre>
        <button
          onClick={reset}
          style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "#84cc16", color: "#09090b", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
