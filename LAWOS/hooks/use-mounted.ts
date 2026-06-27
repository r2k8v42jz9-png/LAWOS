"use client";

import { useEffect, useState } from "react";

/** True only after the first client render — avoids hydration mismatches. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
