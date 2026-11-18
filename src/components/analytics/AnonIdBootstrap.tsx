"use client";

import { useEffect } from "react";
import { getOrCreateAnonId } from "@/lib/anon-id-client";

/** Ensures the first-party anonymous id exists in localStorage and the ss_aid cookie. */
export function AnonIdBootstrap() {
  useEffect(() => {
    getOrCreateAnonId();
  }, []);
  return null;
}
