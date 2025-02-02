/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import * as rt from 'io-ts';
import { createLiteralValueFromUndefinedRT } from '@kbn/io-ts-utils';
import { afterKeyObjectRT, timeRangeRT } from './metrics_explorer';
import type { MetricsUIAggregation } from '../inventory_models/types';

export interface MetricsAPIMetric {
  id: string;
  aggregations: MetricsUIAggregation;
}

const groupByRT = rt.union([rt.string, rt.null, rt.undefined]);

export const MetricsAPIMetricRT = rt.type({
  id: rt.string,
  aggregations: rt.UnknownRecord,
});

export const MetricsAPIRequestRT = rt.intersection([
  rt.type({
    timerange: timeRangeRT,
    indexPattern: rt.string,
    metrics: rt.array(MetricsAPIMetricRT),
    includeTimeseries: rt.union([rt.boolean, createLiteralValueFromUndefinedRT(true)]),
  }),
  rt.partial({
    groupBy: rt.array(groupByRT),
    groupInstance: rt.array(groupByRT),
    modules: rt.array(rt.string),
    afterKey: rt.union([rt.null, afterKeyObjectRT]),
    limit: rt.union([rt.number, rt.null]),
    filters: rt.array(rt.UnknownRecord),
    dropPartialBuckets: rt.boolean,
    alignDataToEnd: rt.boolean,
  }),
]);

export const MetricsAPIPageInfoRT = rt.intersection([
  rt.type({
    afterKey: rt.union([rt.null, afterKeyObjectRT, rt.undefined]),
  }),
  rt.partial({ interval: rt.number }),
]);

export const MetricsAPIColumnTypeRT = rt.keyof({
  date: null,
  number: null,
  string: null,
});

export const MetricsAPIColumnRT = rt.type({
  name: rt.string,
  type: MetricsAPIColumnTypeRT,
});

export const MetricsAPIRowRT = rt.intersection([
  rt.type({
    timestamp: rt.number,
  }),
  rt.record(
    rt.string,
    rt.union([rt.string, rt.number, rt.null, rt.undefined, rt.array(rt.object)])
  ),
]);

export const MetricsAPISeriesRT = rt.intersection([
  rt.type({
    id: rt.string,
    columns: rt.array(MetricsAPIColumnRT),
    rows: rt.array(MetricsAPIRowRT),
  }),
  rt.partial({
    keys: rt.array(rt.string),
  }),
]);

export const MetricsAPIResponseSeriesRT = rt.intersection([
  MetricsAPISeriesRT,
  rt.partial({ metricsets: rt.array(rt.string) }),
]);

export const MetricsAPIResponseRT = rt.type({
  series: rt.array(MetricsAPIResponseSeriesRT),
  info: MetricsAPIPageInfoRT,
});

export type MetricsAPIRequest = Omit<rt.OutputOf<typeof MetricsAPIRequestRT>, 'metrics'> & {
  metrics: MetricsAPIMetric[];
};

export type MetricsAPITimerange = rt.TypeOf<typeof timeRangeRT>;

export type MetricsAPIColumnType = rt.TypeOf<typeof MetricsAPIColumnTypeRT>;

export type MetricsAPIPageInfo = rt.TypeOf<typeof MetricsAPIPageInfoRT>;

export type MetricsAPIColumn = rt.TypeOf<typeof MetricsAPIColumnRT>;

export type MetricsAPIRow = rt.TypeOf<typeof MetricsAPIRowRT>;

export type MetricsAPISeries = rt.TypeOf<typeof MetricsAPISeriesRT>;

export type MetricsAPIResponse = rt.TypeOf<typeof MetricsAPIResponseRT>;
