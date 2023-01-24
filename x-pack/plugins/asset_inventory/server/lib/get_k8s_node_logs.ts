/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { K8sNodeLog } from '../../common/types_api';
import { getLogs } from './get_logs';

interface GetK8sNodeLogsOptions {
  name: string;
  range?: string; // like gte:now-1h
}

export async function getK8sNodeLogs({
  name,
  range = 'gte:now-12h',
}: GetK8sNodeLogsOptions): Promise<K8sNodeLog[]> {
  const [rangeType, rangeLength] = range.split(':');
  const query: QueryDslQueryContainer = {
    bool: {
      filter: [
        {
          range: {
            '@timestamp': {
              [rangeType]: rangeLength,
            },
          },
        },
        {
          bool: {
            must: [
              {
                term: {
                  'kubernetes.node.name': name,
                },
              },
            ],
          },
        },
      ],
    },
  };

  const response = await getLogs<{}>({ query });

  // console.log(JSON.stringify(response, null, 2));

  return response.docs.map((doc) => ({
    timestamp: new Date(doc['@timestamp']).getTime(),
    message: doc.message ? maybeParseJsonMessage(doc.message) : 'No message found',
  }));
}

function maybeParseJsonMessage(message: string) {
  try {
    const parsed = JSON.parse(message);
    if ('message' in parsed && typeof parsed.message === 'string') {
      return parsed.message;
    } else {
      return message;
    }
  } catch (error) {
    return message;
  }
}
