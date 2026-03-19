"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      className="mt-3"
      variant="outline"
      onClick={async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? "Código copiado" : "Copiar código"}
    </Button>
  );
}
