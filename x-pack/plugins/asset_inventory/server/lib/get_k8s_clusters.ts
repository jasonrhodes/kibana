/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { EcsOrchestratorFieldset, K8sCluster } from '../../common/types_api';
import { esClient } from './es_client';
import { getK8sNodes } from './get_k8s_nodes';

export async function getK8sClusters(): Promise<K8sCluster[]> {
  const dsl: SearchRequest = {
    index: 'assets',
    query: {
      bool: {
        must: [
          {
            term: {
              ['asset.type.keyword']: 'k8s.cluster',
            },
          },
        ],
      },
    },
    collapse: {
      field: 'asset.ean.keyword',
    },
    sort: {
      '@timestamp': {
        order: 'desc',
      },
    },
  };

  // console.log('Performing K8s Clusters Query', '\n\n', JSON.stringify(dsl, null, 2));

  const response = await esClient.search<{
    'asset.name': string;
    'asset.ean': string;
    'asset.id': string;
    orchestrator: EcsOrchestratorFieldset;
  }>(dsl);

  const results = await Promise.all(
    response.hits.hits.map(async (hit) => {
      if (!hit._source) {
        throw new Error('Missing _source in cluster result');
      }
      return {
        name: hit._source['asset.name'],
        nodes: await getK8sNodes({ clusterEan: hit._source['asset.ean'] }),
        status: 'Healthy',
        version: hit._source?.orchestrator?.cluster?.version || 'Unspecified',
      };
    })
  );

  return results;
}
