/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { SearchHit, SearchInnerHitsResult } from '@elastic/elasticsearch/lib/api/types';
import { EsClientMap } from '../../types';
import { ApiRouteError } from '../route_error';
import { RouteFactory } from '../route_factory';
import {
  ObservabilityDataRequestHandlerContext,
} from '../types';
import * as t from 'io-ts';
import { FullHostRecord, RouteResponseList } from '@kbn/observability-data-plugin/common/api_types';
import { filterAsQuerySourceList, isQuerySource, QuerySource } from '@kbn/observability-data-plugin/common/runtime_types';
import { Logger } from '@kbn/logging';

interface LogsMetricsHostHitSource {
  '@timestamp': string;
  host: {
    hostname: string;
  };
}

interface ProfilingHostHitSource {
  '@timestamp': number;
  'profiling.host.name': string;
}

export function registerListHostsRoute(
  routeFactory: RouteFactory<ObservabilityDataRequestHandlerContext>
) {
  const queryRT = t.intersection([
    t.type({
      type: t.literal('hosts'),
      dateRangeFrom: t.string
    }),
    t.partial({
      sources: t.string,
      dateRangeTo: t.string
    })
  ]);

  type RequestParams = undefined;
  type RequestQuery = t.TypeOf<typeof queryRT>;
  type RequestBody = undefined;

  routeFactory.create<RouteResponseList, RequestParams, RequestQuery, RequestBody>({
    method: 'get',
    path: '/internal/observability_data/list',
    validate: {
      query: queryRT
    },
    handler: async (context, request) => {
      const { logger } = routeFactory;
      try {
        const { esClient } = context.dependencies as { esClient: EsClientMap };
        const { query } = request;
        const rawSourceList = (query.sources || '').split(',');
        const sourceList = filterAsQuerySourceList(rawSourceList);
        const { dateRangeFrom, dateRangeTo = 'now' } = query;

        if (rawSourceList.length > sourceList.length) {
          // TODO: fail request on invalid sources?
          const invalid = rawSourceList.filter(s => !isQuerySource(s));
          logger.warn(`Invalid value(s) detected in "sources" query parameter: ${invalid.join(',')}`);
        }

        logger.info('Received QUERY: ' + JSON.stringify(query));

        const hostsFromLogsAndMetrics = await getHostsFromLogsAndMetrics({
          logger,
          esClient,
          sourceList,
          dateRangeFrom,
          dateRangeTo
        });

        const hostsFromProfiling = await getHostsFromProfiling({
          logger,
          esClient,
          sourceList,
          dateRangeFrom,
          dateRangeTo
        });

        const hosts = combineHosts(hostsFromLogsAndMetrics, hostsFromProfiling);
        hosts.sort((a, b) => (a.timestamp || 0) > (b.timestamp || 0) ? -1 : 1);

        return { hosts };
      } catch (error: unknown) {
        if (error instanceof ApiRouteError) {
          logger.error(`API route error caught: ${error.message} / ${error.statusCode} / ${error.stack}`);
          throw error;
        }
        if (error instanceof Error) {
          logger.error(`An error occurred... ${error.message} / ${error.stack}`)
        } else {
          logger.error(`Unknown error caught... ${error}`);
        }
        throw new ApiRouteError(String(error), {
          statusCode: 500,
        });
      }
    },
  });
}

function combineHosts(...sets: FullHostRecord[][]): FullHostRecord[] {
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

async function getHostsFromProfiling({
  logger,
  esClient,
  sourceList,
  dateRangeFrom,
  dateRangeTo
}: {
  logger: Logger;
  esClient: EsClientMap;
  sourceList: QuerySource[];
  dateRangeFrom: string;
  dateRangeTo: string;
}): Promise<FullHostRecord[]> {
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



async function getHostsFromLogsAndMetrics({
  logger,
  esClient,
  sourceList,
  dateRangeFrom,
  dateRangeTo
}: {
  logger: Logger;
  esClient: EsClientMap;
  sourceList: QuerySource[];
  dateRangeFrom: string;
  dateRangeTo: string;
}): Promise<FullHostRecord[]> {
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

function extractInnerHits<T = unknown>(innerHits: SearchInnerHitsResult | undefined) {
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
