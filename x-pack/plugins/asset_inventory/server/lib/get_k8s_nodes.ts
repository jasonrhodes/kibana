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
import { esClient } from './es_client';
import { getK8sPods } from './get_k8s_pods';

interface GetK8sNodesOptions {
  clusterEan?: string;
  includePods?: boolean;
}

export async function getK8sNodes({
  clusterEan,
  includePods = false,
}: GetK8sNodesOptions = {}): Promise<K8sNode[]> {
  const dsl: SearchRequest = {
    index: ASSETS_INDEX,
    query: {
      bool: {
        must: [
          {
            term: {
              ['asset.type']: 'k8s.node',
            },
          },
          {
            term: {
              'asset.parents': clusterEan,
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

  debug('Performing K8s Nodes Query', '\n\n', JSON.stringify(dsl, null, 2));

  const response = await esClient.search<Asset>(dsl);

  const results = await Promise.all(
    (Array.isArray(response.hits?.hits) ? response.hits.hits : []).map(async (hit) => {
      if (!hit._source) {
        throw new Error('Missing _source in node result');
      }
      const doc = hit._source;
      return {
        '@timestamp': doc['@timestamp'],
        id: doc['asset.id'],
        name: doc['asset.name'],
        ean: doc['asset.ean'],
        pods: includePods ? await getK8sPods({ nodeEan: doc['asset.ean'] }) : [],
      };
    })
  );

  return results;
}
