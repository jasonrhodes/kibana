/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  AggregationsAggregationContainer,
  QueryDslQueryContainer,
} from '@elastic/elasticsearch/lib/api/types';
import { signalsEsClient } from './es_client';

interface GetMetricsOptions {
  query?: QueryDslQueryContainer;
  aggregations?: Record<string, AggregationsAggregationContainer>;
}

export async function getMetrics<T = unknown, U = unknown>({
  query,
  aggregations,
}: GetMetricsOptions) {
  const metricsResponse = await signalsEsClient.search<T, U>({
    index: 'metrics-*',
    query,
    aggregations,
    sort: {
      '@timestamp': {
        order: 'desc',
      },
    },
  });

  const docs = (metricsResponse.hits?.hits || []).map((metric) => metric._source);

  return { docs, aggregations: metricsResponse.aggregations };
}
