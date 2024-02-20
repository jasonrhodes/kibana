import { Logger } from "@kbn/logging";
import { QuerySource } from "@kbn/observability-data-plugin/common/runtime_types";
import { EsClientMap } from "../../types";

export interface GetHostsFetchOptions {
  logger: Logger;
  esClient: EsClientMap;
  sourceList: QuerySource[];
  dateRangeFrom: string;
  dateRangeTo: string;
}

export interface LogsMetricsHostHitSource {
  '@timestamp': string;
  host: {
    hostname: string;
  };
}

export interface ProfilingHostHitSource {
  '@timestamp': number;
  'profiling.host.name': string;
}