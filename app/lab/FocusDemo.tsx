"use client";

import { useState } from "react";
import { Mockup } from "@/lib/types";
import { Button } from "@/components/ds/Button";
import { FocusStage } from "@/components/ds/FocusStage";

export function FocusDemo({ mockup, similars }: { mockup: Mockup; similars: Mockup[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Open focus stage
      </Button>
      {open ? (
        <FocusStage
          mockup={mockup}
          similars={similars}
          onClose={() => setOpen(false)}
          onSelect={() => {}}
        />
      ) : null}
    </>
  );
}
