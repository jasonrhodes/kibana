import { FullHostRecord } from "@kbn/observability-data-plugin/common/api_types";

export function combineHosts(...sets: FullHostRecord[][]): FullHostRecord[] {
  return sets.reduce<FullHostRecord[]>((acc, set) => {
    for (let i = 0; i < set.length; i++) {
      const record = set[i];
      // TODO: combine containers, services, etc. also
      // TODO: should account for the source of the found doc too
      const alreadyAdded = acc.find((added) => added.hostname === record.hostname);
      if (alreadyAdded) {
        const mostRecentTimestamp = Math.max(
          (alreadyAdded.timestamp || 0), 
          (record.timestamp || 0)
        );
        if (mostRecentTimestamp > 0) {
          alreadyAdded.timestamp = mostRecentTimestamp;
        }
      } else {
        acc.push(record);
      }
    }
    return acc;
  }, [])
}