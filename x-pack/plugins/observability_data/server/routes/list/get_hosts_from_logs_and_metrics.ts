import { FullHostRecord } from "@kbn/observability-data-plugin/common/api_types";
import { extractInnerHits } from "./extractInnerHits";
import { GetHostsFetchOptions, LogsMetricsHostHitSource } from "./types";

export async function getHostsFromLogsAndMetrics({
  logger,
  esClient,
  sourceList,
  dateRangeFrom,
  dateRangeTo
}: GetHostsFetchOptions): Promise<FullHostRecord[]> {
  const indices: string[] = [];

  if (sourceList.includes('logs')) {
    indices.push('remote_cluster:logs-*,remote_cluster:filebeat*');
  }

  if (sourceList.includes('metrics')) {
    indices.push('remote_cluster:metrics-*,remote_cluster:metricbeat*');
  }

  const dsl = {
    index: indices.join(','),
    _source: ['@timestamp', 'host.hostname'],
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
              field: 'host.hostname',
            },
          },
        ],
      },
    },
    collapse: {
      field: 'host.hostname',
      inner_hits: [
        {
          name: 'services_for_host',
          _source: ['service'],
          collapse: { field: 'service.name' },
          size: 100,
        },
        {
          name: 'containers_for_host',
          _source: ['container'],
          collapse: { field: 'container.id' },
          size: 1000,
        },
      ],
    },
  };

  logger.info(JSON.stringify(dsl, null, 2));
  const result = await esClient.asScopedUser.search<LogsMetricsHostHitSource>(dsl);

  if (result.hits?.hits?.length === 0) {
    return [];
  }

  const hosts = result.hits.hits.map((hit) => {
    const containerHits = extractInnerHits<{ container: { id: string }}>(hit.inner_hits?.containers_for_host);
    const serviceHits = extractInnerHits<{ service: { name: string }}>(hit.inner_hits?.services_for_host);
    
    return {
      timestamp: hit._source?.['@timestamp'] ? (new Date(hit._source?.['@timestamp']).getTime()) : undefined,
      hostname: hit._source?.host.hostname || 'unknown',
      containers: containerHits.map(c => c._source!!),
      services: serviceHits.map(s => s._source!!)
    };
  });

  return hosts;
}