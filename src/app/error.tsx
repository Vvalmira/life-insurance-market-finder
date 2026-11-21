"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="route-state">
      <span className="eyebrow">Something went wrong</span>
      <h1>The market dashboard could not be loaded.</h1>
      <p>
        Please try the request again. If the problem continues, check the health
        endpoint and latest import status.
      </p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
