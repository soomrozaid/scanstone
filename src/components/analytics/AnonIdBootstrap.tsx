"use client";

import { useEffect } from "react";
import { getOrCreateAnonId } from "@/lib/anon-id-client";
import { captureAttribution } from "@/lib/attribution-client";

/** Ensures the first-party anonymous id and first-touch attribution exist. */
export function AnonIdBootstrap() {
  useEffect(() => {
    getOrCreateAnonId();
    captureAttribution();
  }, []);
  return null;
}
