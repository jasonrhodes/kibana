/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { debug } from '../../common/debug_log';
import { EcsOrchestratorFieldset, K8sCluster } from '../../common/types_api';
import { ASSETS_INDEX } from '../constants';
import { esClient } from './es_client';
import { getK8sNodes } from './get_k8s_nodes';

export async function getK8sCluster(name: string): Promise<K8sCluster> {
  const dsl: SearchRequest = {
    index: ASSETS_INDEX,
    query: {
      bool: {
        must: [
          {
            term: {
              ['asset.name']: name,
            },
          },
          {
            term: {
              ['asset.type']: 'k8s.cluster',
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

  debug('Performing K8s Clusters Query', '\n\n', JSON.stringify(dsl, null, 2));

  const response = await esClient.search<{
    '@timestamp': string;
    'asset.name': string;
    'asset.ean': string;
    'asset.id': string;
    orchestrator: EcsOrchestratorFieldset;
  }>(dsl);

  const { _source: cluster } = response.hits.hits[0];
  if (!cluster) {
    throw new Error('No cluster returned');
  }
  const nodes = await getK8sNodes({ clusterEan: cluster['asset.ean'] });

  return {
    '@timestamp': cluster['@timestamp'],
    name: cluster['asset.name'],
    nodes,
    status: 'Healthy',
    version: cluster.orchestrator?.cluster?.version || 'unspecified',
  };
}
