/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { QueryDslQueryContainer, SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { debug } from '../../common/debug_log';
import { Asset, K8sPod } from '../../common/types_api';
import { ASSETS_INDEX } from '../constants';
import { esClient } from './es_client';

interface GetK8sPodsOptions {
  nodeEan?: string;
}

export async function getK8sPods({ nodeEan }: GetK8sPodsOptions = {}): Promise<K8sPod[]> {
  const dsl: SearchRequest = {
    index: ASSETS_INDEX,
    query: {
      bool: {
        must: [
          {
            term: {
              ['asset.type']: 'k8s.pod',
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

  if (nodeEan) {
    const nodeParent: QueryDslQueryContainer = {
      term: {
        'asset.parents': nodeEan,
      },
    };
    if (!dsl.query?.bool?.must) {
      if (dsl.query?.bool) {
        dsl.query.bool.must = [nodeParent];
      } else if (dsl.query) {
        dsl.query.bool = { must: [nodeParent] };
      } else {
        dsl.query = { bool: { must: [nodeParent] } };
      }
    } else if (Array.isArray(dsl.query.bool.must)) {
      dsl.query.bool.must.push(nodeParent);
    } else {
      dsl.query.bool.must = [dsl.query.bool.must, nodeParent];
    }
  }

  debug('Performing K8s Pods by Node ID Query', '\n\n', JSON.stringify(dsl, null, 2));

  const response = await esClient.search<Asset>(dsl);

  const results = await Promise.all(
    (Array.isArray(response.hits?.hits) ? response.hits.hits : []).map(async (hit) => {
      if (!hit._source) {
        throw new Error('Missing _source in node result');
      }
      const s = hit._source;
      return {
        '@timestamp': s['@timestamp'],
        id: s['asset.id'],
        name: s['asset.name'],
        ean: s['asset.ean'],
      };
    })
  );

  return results;
}
