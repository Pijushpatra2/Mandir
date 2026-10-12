"use client";

import { useState, useEffect } from "react";
import axios from "axios";

/**
 * Deep merge utility to safely layer dynamic CMS values over the static baseline.
 * If dynamic data is missing a key or property, the static baseline value is preserved.
 */
function deepMerge<T>(target: T, source: any): T {
  if (!source || typeof source !== "object") return target;
  if (!target || typeof target !== "object") return source;

  const result: any = Array.isArray(target) ? [...target] : { ...target };

  for (const key of Object.keys(source)) {
    const sourceVal = source[key];
    const targetVal = result[key];

    if (
      sourceVal !== null &&
      typeof sourceVal === "object" &&
      !Array.isArray(sourceVal) &&
      targetVal !== null &&
      typeof targetVal === "object" &&
      !Array.isArray(targetVal)
    ) {
      result[key] = deepMerge(targetVal, sourceVal);
    } else if (sourceVal !== undefined && sourceVal !== null) {
      result[key] = sourceVal;
    }
  }

  return result as T;
}

/**
 * Resilient hook for public temple pages.
 * Guarantees zero breakage:
 * - Always renders defaultContent immediately.
 * - In the background, tries to fetch active CMS overrides.
 * - If the database or server is offline/unreachable/errors, silently retains the defaultContent.
 */
export function useCmsPage<T>(slug: string, defaultContent: T): { content: T; isLive: boolean } {
  const [content, setContent] = useState<T>(defaultContent);
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchCmsData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const res = await axios.get(`${apiUrl}/cms/pages/${slug}`, {
          timeout: 4500
        });

        if (res.data?.success && res.data?.data?.sections && isMounted) {
          const sections = res.data.data.sections;
          if (Object.keys(sections).length > 0) {
            setContent((prev) => deepMerge(prev, sections));
            setIsLive(true);
          }
        }
      } catch (err: any) {
        // Silently fall back to hardcoded static baseline without breaking UI
        if (process.env.NODE_ENV === "development") {
          console.info(`[CMS Fallback Active for "${slug}"] Using static baseline. Error:`, err?.message || err);
        }
      }
    }

    fetchCmsData();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return { content, isLive };
}
