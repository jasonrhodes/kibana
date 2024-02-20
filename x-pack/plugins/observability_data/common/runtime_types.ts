import * as t from 'io-ts';

export const querySourceRt = t.keyof({
  logs: true,
  metrics: true,
  profiling: true
});

export type QuerySource = t.TypeOf<typeof querySourceRt>;

export function isQuerySource(x: string): x is QuerySource {
  const decoded = querySourceRt.decode(x);
  return decoded._tag === "Right";
}

export function isQuerySourceList(list: string[]): list is QuerySource[] {
  return list.every((x) => isQuerySource(x));
}

export function filterAsQuerySourceList(list: string[]) {
  const filtered = list.filter((x) => isQuerySource(x));
  return filtered as QuerySource[];
}