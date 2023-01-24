/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { debug } from '../../common/debug_log';
import { Asset, K8sCluster } from '../../common/types_api';
import { ASSETS_INDEX } from '../constants';
import { esClient } from './es_client';
import { getK8sNodes } from './get_k8s_nodes';

interface GetK8sClustersOptions {
  includeNodes?: boolean;
}

export async function getK8sClusters({ includeNodes = false }: GetK8sClustersOptions = {}): Promise<
  K8sCluster[]
> {
  const dsl: SearchRequest = {
    index: ASSETS_INDEX,
    query: {
      bool: {
        must: [
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

  const response = await esClient.search<Asset>(dsl);

  const results = await Promise.all(
    (Array.isArray(response.hits?.hits) ? response.hits.hits : []).map(async (hit) => {
      if (!hit._source) {
        throw new Error('Missing _source in cluster result');
      }
      const doc = hit._source;
      return {
        '@timestamp': doc['@timestamp'],
        name: doc['asset.name'] || doc['asset.id'],
        ean: doc['asset.ean'],
        nodes: includeNodes ? await getK8sNodes({ clusterEan: doc['asset.ean'] }) : [],
        status: doc['asset.status'] || 'UNKNOWN',
        cloud: {
          provider: doc['cloud.provider'],
          region: doc['cloud.region'],
        },
        version: doc['orchestrator.cluster.version'],
      };
    })
  );

  return results;
}
