/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  AggregationsAggregationContainer,
  QueryDslQueryContainer,
  SearchRequest,
} from '@elastic/elasticsearch/lib/api/types';
import { debug } from '../../common/debug_log';
import { signalsEsClient } from './es_client';

interface GetLogsOptions {
  query?: QueryDslQueryContainer;
  aggregations?: Record<string, AggregationsAggregationContainer>;
}

function ifNotUndefined<T>(x: ESLogDocument | undefined): x is ESLogDocument {
  return x !== undefined;
}

export async function getLogs<U = unknown>({ query, aggregations }: GetLogsOptions) {
  const dsl: SearchRequest = {
    index: 'logs-*',
    query,
    aggregations,
    size: 500,
    sort: {
      '@timestamp': {
        order: 'desc',
      },
    },
  };

  debug('Performing Logs Request', JSON.stringify(dsl));
  const logsResponse = await signalsEsClient.search<ESLogDocument, U>(dsl);
  const docs = (logsResponse.hits?.hits || []).map((log) => log._source).filter(ifNotUndefined);

  return { docs, aggregations: logsResponse.aggregations };
}

interface ESLogDocument {
  container?: {
    image?: {
      name?: string;
    };
    runtime?: string;
    id?: string;
  };
  kubernetes?: {
    node?: {
      uid?: string;
      hostname?: string;
      name?: string;
      labels: Record<string, string>;
    };
    pod?: {
      uid?: string;
      ip?: string;
      name?: string;
    };
    namespace?: string;
    namespace_uid?: string;
    daemonset?: {
      name?: string;
    };
    namespace_labels?: Record<string, string>;
    labels?: Record<string, string>;
  };
  agent?: {
    name?: string;
    id?: string;
    type?: string;
    ephemeral_id?: string;
    version?: string;
  };
  log?: {
    file?: {
      path?: string;
    };
    offset?: number;
  };
  elastic_agent?: {
    id?: string;
    version?: string;
    snapshot?: boolean;
  };
  message?: string;
  cloud?: {
    availability_zone?: string;
    image?: {
      id?: string;
    };
    instance?: {
      id?: string;
    };
    provider?: string;
    machine?: {
      type?: string;
    };
    service?: {
      name?: string;
    };
    region?: string;
    account?: {
      id?: string;
    };
  };
  input?: {
    type?: string;
  };
  '@timestamp': string;
  ecs?: {
    version?: string;
  };
  stream?: string;
  data_stream: {
    namespace?: string;
    type: 'logs';
    dataset?: string;
  };
  host: {
    hostname?: string;
    os?: {
      kernel?: string;
      codename?: string;
      name?: string;
      type?: string;
      family?: string;
      version?: string;
      platform?: string;
    };
    containerized?: boolean;
    ip?: string[];
    name?: string;
    id?: string;
    mac?: string[];
    architecture?: string;
  };
  event?: {
    agent_id_status?: string;
    ingested?: string;
    dataset?: string;
  };
}
