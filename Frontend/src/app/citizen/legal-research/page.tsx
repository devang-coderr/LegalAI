"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Citizen Legal Research was folded into Case Intelligence and removed from
 * Citizen navigation. This route is kept (rather than deleted) purely so any
 * old bookmark/link doesn't 404, and safely redirects into the feature that
 * replaced it. Lawyer Mode's Legal Research (`/lawyer/legal-research`) is a
 * separate, untouched route.
 */
export default function CitizenLegalResearchRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/citizen/case-intelligence");
  }, [router]);
  return null;
}
