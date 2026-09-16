"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

export function GreetingHeader({ username }: { username: string }) {
  // Rendered only after mount to avoid an SSR/client hydration mismatch on
  // the current time (the server and browser clocks are never in the same
  // instant, even by a second, which would make the formatted string differ).
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    // Mount-only read of the browser clock — same escape-hatch case as
    // useCurrentUser, not the anti-pattern set-state-in-effect targets.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(format(new Date(), "h:mm a, MMM d, yyyy"));
  }, []);

  return (
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
      <div>
        <p className="text-sm text-muted-foreground">Aziz Brothers</p>
        <h1 className="text-xl font-semibold">
          Hey {username}, <span className="text-muted-foreground">have a nice day</span>
        </h1>
      </div>
      <p className="text-sm text-muted-foreground">{now}</p>
    </div>
  );
}
