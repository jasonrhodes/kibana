/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/* eslint-disable @typescript-eslint/naming-convention */

import {
  AggregationsAggregationContainer,
  AggregationsAvgAggregate,
  AggregationsDateHistogramAggregate,
  AggregationsMaxAggregate,
  QueryDslQueryContainer,
} from '@elastic/elasticsearch/lib/api/types';
import { K8sNodeMetricBucket } from '../../common/types_api';
import { getMetrics } from './get_metrics';

interface GetK8sNodeMetricsOptions {
  name: string;
  range?: string; // like gte:now-1h
}

export async function getK8sNodeMetrics({
  name,
  range = 'gte:now-12h',
}: GetK8sNodeMetricsOptions): Promise<K8sNodeMetricBucket[]> {
  const [rangeType, rangeLength] = range.split(':');
  const query: QueryDslQueryContainer = {
    bool: {
      filter: [
        {
          range: {
            '@timestamp': {
              [rangeType]: rangeLength,
            },
          },
        },
        {
          bool: {
            must: [
              {
                term: {
                  'data_stream.dataset': 'kubernetes.node',
                },
              },
              {
                term: {
                  'kubernetes.node.name': name,
                },
              },
            ],
          },
        },
      ],
    },
  };

  const aggregations: Record<string, AggregationsAggregationContainer> = {
    metrics_histogram: {
      date_histogram: {
        field: '@timestamp',
        calendar_interval: '1h',
      },
      aggs: {
        averageMemoryUsage: {
          avg: {
            field: 'kubernetes.node.memory.usage.bytes',
          },
        },
        maxMemoryUsage: {
          max: {
            field: 'kubernetes.node.memory.usage.bytes',
          },
        },
        averageMemoryAvailable: {
          avg: {
            field: 'kubernetes.node.memory.available.bytes',
          },
        },
        averageCpuCoreNs: {
          avg: {
            field: 'kubernetes.node.cpu.usage.core.ns',
          },
        },
        maxCpuCoreNs: {
          max: {
            field: 'kubernetes.node.cpu.usage.core.ns',
          },
        },
      },
    },
  };

  const response = await getMetrics<
    unknown,
    { metrics_histogram: AggregationsDateHistogramAggregate }
  >({ query, aggregations });

  const aggs =
    response.aggregations && Array.isArray(response.aggregations?.metrics_histogram?.buckets)
      ? response.aggregations.metrics_histogram.buckets
      : [];

  return aggs.map(
    ({
      key,
      key_as_string,
      averageMemoryAvailable,
      averageMemoryUsage,
      maxMemoryUsage,
      averageCpuCoreNs,
      maxCpuCoreNs,
    }) => ({
      timestamp: key,
      date: key_as_string,
      averageMemoryAvailable: (averageMemoryAvailable as AggregationsAvgAggregate).value,
      averageMemoryUsage: (averageMemoryUsage as AggregationsAvgAggregate).value,
      maxMemoryUsage: (maxMemoryUsage as AggregationsMaxAggregate).value,
      averageCpuCoreNs: (averageCpuCoreNs as AggregationsAvgAggregate).value,
      maxCpuCoreNs: (maxCpuCoreNs as AggregationsAvgAggregate).value,
    })
  );
}
