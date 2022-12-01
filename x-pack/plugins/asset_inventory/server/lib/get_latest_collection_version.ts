/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { debug } from '../../common/debug_log';
import { ASSETS_INDEX } from '../constants';
import { esClient } from './es_client';

export async function getLatestCollectionVersion() {
  const dsl: SearchRequest = {
    index: ASSETS_INDEX,
    size: 0,
    aggregations: {
      maxVersion: {
        max: {
          field: 'asset.collectionVersion',
        },
      },
    },
  };

  debug('Performing Latest Version Query', '\n\n', JSON.stringify(dsl, null, 2));

  const response = await esClient.search<unknown, { maxVersion: { value: number } }>(dsl);
  return response.aggregations?.maxVersion.value || 0;
}
