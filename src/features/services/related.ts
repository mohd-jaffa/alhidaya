// Which other services a service page suggests.
import { randomInt } from "node:crypto";

import { RELATED_SERVICE_COUNT } from "@/constants/limits";

import type { PublishedService } from "./api";

/** A random subset without repeats, retaining published order and leaving the cached list untouched. */
export function chooseRelatedServices(candidates: readonly PublishedService[]): PublishedService[] {
  const selected = [...candidates];
  while (selected.length > RELATED_SERVICE_COUNT) selected.splice(randomInt(selected.length), 1);
  return selected;
}
