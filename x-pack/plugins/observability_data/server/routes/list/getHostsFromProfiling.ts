import { GetHostsFetchOptions, ProfilingHostHitSource } from "./types";
import { FullHostRecord } from '@kbn/observability-data-plugin/common/api_types';

export async function getHostsFromProfiling({
  logger,
  esClient,
  sourceList,
  dateRangeFrom,
  dateRangeTo
}: GetHostsFetchOptions): Promise<FullHostRecord[]> {
  if (!sourceList.includes('profiling')) {
    return [];
  }

  const dsl = {
    index: 'remote_cluster:profiling-hosts',
    _source: ['@timestamp', 'profiling.host.name'],
    query: {
      bool: {
        filter: [
          {
            range: {
              '@timestamp': {
                gte: dateRangeFrom,
                lte: dateRangeTo
              },
            },
          },
        ],
        must: [
          {
            exists: {
              field: 'profiling.host.name',
            },
          },
        ],
      },
    },
    collapse: {
      field: "profiling.host.name"
    },
    sort: [
      {
        ["@timestamp"]: {
          order: "desc"
        }
      }
    ]
  };

  logger.info(JSON.stringify(dsl, null, 2));
  const result = await esClient.asScopedUser.search<ProfilingHostHitSource>(dsl);
  logger.info(JSON.stringify(result));

  if (result.hits?.hits?.length === 0) {
    return [];
  }

  return result.hits.hits.map((hit) => ({
    timestamp: hit._source?.['@timestamp'] ? hit._source?.['@timestamp'] * 1000 : undefined,
    hostname: hit._source?.['profiling.host.name'] || 'unknown',
    containers: [],
    services: []
  }));
}