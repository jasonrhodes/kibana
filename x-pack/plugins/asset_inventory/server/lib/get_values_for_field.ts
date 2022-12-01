/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { debug } from '../../common/debug_log';
import { Asset } from '../../common/types_api';
import { ASSETS_INDEX } from '../constants';
import { esClient } from './es_client';

interface GetValuesForFieldOptions {
  field: keyof Asset;
  version?: number;
  searchText?: string;
}

interface AggBucket {
  key: string;
  doc_count: number;
}

export async function getValuesForField({
  field,
  version,
  searchText,
}: GetValuesForFieldOptions): Promise<AggBucket[]> {
  const dsl: SearchRequest = {
    index: ASSETS_INDEX,
    size: 0,
    aggs: {
      field_values: {
        terms: {
          field,
          include: searchText,
        },
      },
    },
  };

  if (version || version === 0) {
    dsl.query = {
      bool: {
        must: [
          {
            term: {
              ['asset.collection_version']: version,
            },
          },
        ],
      },
    };
  }

  debug(`Performing Field Value Query for ${field}`, '\n\n', JSON.stringify(dsl, null, 2));

  const response = await esClient.search<{}, { field_values: { buckets: AggBucket[] } }>(dsl);
  return response.aggregations?.field_values.buckets || [];
}
