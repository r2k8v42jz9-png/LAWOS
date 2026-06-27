/**
 * Public type surface for LawOS.
 *
 * Components and pages should import domain types from here (or from
 * "@/lib/data"). Both resolve to the same definitions in lib/data/types.ts —
 * this barrel just gives the conventional `@/types` import path.
 */
export type * from "@/lib/data/types";
export type { DataAdapter, AdapterId } from "@/lib/data";
