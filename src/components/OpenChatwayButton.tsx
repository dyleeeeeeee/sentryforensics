"use client";

import { useCallback, useState } from "react";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

declare global {
  interface Window {
    $chatway?: {
      openChatwayWidget?: () => void;
    };
  }
}

export function OpenChatwayButton({ className, children }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const onClick = useCallback(() => {
    const open = window.$chatway?.openChatwayWidget;

    if (typeof open === "function") {
      open();
      return;
    }

    setIsLoading(true);

    const start = Date.now();
    const interval = window.setInterval(() => {
      const openLater = window.$chatway?.openChatwayWidget;
      if (typeof openLater === "function") {
        window.clearInterval(interval);
        setIsLoading(false);
        openLater();
        return;
      }

      if (Date.now() - start > 6000) {
        window.clearInterval(interval);
        setIsLoading(false);
      }
    }, 200);
  }, []);

  return (
    <button type="button" className={className} onClick={onClick}>
      {children ?? (isLoading ? "Opening Live Chat…" : "Open Live Chat")}
    </button>
  );
}
