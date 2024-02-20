/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { EsClientMap } from '../../types';
import { ApiRouteError } from '../route_error';
import { RouteFactory } from '../route_factory';
import {
  ObservabilityDataRequestHandlerContext,
} from '../types';
import * as t from 'io-ts';
import { RouteResponseList } from '@kbn/observability-data-plugin/common/api_types';
import { filterAsQuerySourceList, isQuerySource } from '@kbn/observability-data-plugin/common/runtime_types';
import { getHostsFromProfiling } from './get_hosts_from_profiling';
import { getHostsFromLogsAndMetrics } from './get_hosts_from_logs_and_metrics';
import { combineHosts } from './combine_hosts';

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
