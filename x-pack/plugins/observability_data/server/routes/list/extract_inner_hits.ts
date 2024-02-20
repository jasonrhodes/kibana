import { SearchHit, SearchInnerHitsResult } from "@elastic/elasticsearch/lib/api/types";

export function extractInnerHits<T = unknown>(innerHits: SearchInnerHitsResult | undefined) {
  if (innerHits === undefined) {
    return [];
  }

  const { total = 0, hits } = innerHits.hits;

  if (typeof total === "number" && total === 0) {
    return [];
  }

  if (typeof total !== "number" && typeof total.value === "number" && total.value === 0) {
    return [];
  }

  if (hits.length === 0) {
    return [];
  }

  return hits as unknown as SearchHit<T>[];
}