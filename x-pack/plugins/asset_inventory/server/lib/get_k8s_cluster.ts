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

export async function getK8sCluster({
  name,
  ean,
  nodeEan,
  includePods = false,
}: {
  name?: string;
  ean?: string;
  nodeEan?: string;
  includePods?: boolean;
}): Promise<K8sCluster | undefined> {
  const searchByTerm: Record<string, any> = name
    ? { ['asset.name']: name }
    : ean
    ? { ['asset.ean']: ean }
    : nodeEan
    ? { ['asset.children']: nodeEan }
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

  debug('Performing K8s Single Cluster Query', '\n\n', JSON.stringify(dsl, null, 2));

  const response = await esClient.search<Asset>(dsl);

  const result = Array.isArray(response.hits?.hits) ? response.hits.hits[0] : null;

  if (!result || !result._source) {
    return undefined;
  }
  const cluster = result._source;
  const nodes = await getK8sNodes({ clusterEan: cluster['asset.ean'], includePods });

  return {
    '@timestamp': cluster['@timestamp'],
    name: cluster['asset.name'],
    ean: cluster['asset.ean'],
    nodes,
    status: cluster['asset.status'] || 'UNKNOWN',
    version: cluster['orchestrator.cluster.version'],
    cloud: {
      provider: cluster['cloud.provider'],
      region: cluster['cloud.region'],
    },
  };
}
