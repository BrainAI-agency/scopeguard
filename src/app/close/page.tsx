"use client";

import { useEffect } from "react";

export default function ClosePage() {
  useEffect(() => {
    window.close();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-medium">Authorization complete</p>
        <p className="mt-2 text-sm text-muted-foreground">
          You can close this window.
        </p>
        <button
          onClick={() => window.close()}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          Close Window
        </button>
      </div>
    </div>
  );
}
