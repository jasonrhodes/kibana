/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { debug } from '../../common/debug_log';
import { Asset, K8sNode } from '../../common/types_api';
import { ASSETS_INDEX } from '../constants';
import { esClient, signalsEsClient } from './es_client';
import { getK8sCluster } from './get_k8s_cluster';
import { getK8sPods } from './get_k8s_pods';

export interface GetNodeOptions {
  name?: string;
  uid?: string;
  includeMetrics?: boolean;
  includeLogs?: boolean;
}

export async function getK8sNode({
  name,
  uid,
  includeMetrics = false,
  includeLogs = false,
}: GetNodeOptions): Promise<K8sNode> {
  const searchByTerm: Record<string, any> = uid
    ? { ['asset.id']: uid }
    : name
    ? { ['asset.name']: name }
    : {};

  const dsl: SearchRequest = {
    index: ASSETS_INDEX,
    query: {
      bool: {
        must: [
          {
            term: searchByTerm,
          },
          {
            term: {
              ['asset.type']: 'k8s.node',
            },
          },
        ],
      },
    },
    collapse: {
      field: 'asset.ean',
    },
    sort: {
      '@timestamp': {
        order: 'desc',
      },
    },
  };

  debug('Performing K8s Single Node Query', '\n\n', JSON.stringify(dsl, null, 2));

  const response = await esClient.search<Asset>(dsl);

  const { _source: node = null } = Array.isArray(response.hits?.hits) ? response.hits.hits[0] : {};
  if (!node) {
    throw new Error('No node returned');
  }
  const pods = await getK8sPods({ nodeEan: node['asset.ean'] });
  const parents = node['asset.parents'];
  const cluster = await getK8sCluster({ ean: Array.isArray(parents) ? parents[0] : parents });

  const signalSearchByTerms: Array<Record<string, any>> = [];
  if (name) {
    signalSearchByTerms.push({
      term: { ['kubernetes.node.name']: name },
    });
  }
  if (uid) {
    signalSearchByTerms.push({
      term: { ['kubernetes.node.uid']: uid },
    });
  }

  const result: K8sNode = {
    '@timestamp': node['@timestamp'],
    name: node['asset.name'],
    ean: node['asset.ean'],
    id: node['asset.id'],
    cluster,
    pods,
  };

  if (includeMetrics) {
    const metricsResponse = await signalsEsClient.search({
      index: 'metrics-*',
      query: {
        bool: {
          should: signalSearchByTerms,
          minimum_should_match: 1,
        },
      },
      sort: {
        '@timestamp': {
          order: 'desc',
        },
      },
    });

    result.metrics = metricsResponse.hits?.hits || [];
  }

  return result;
}
