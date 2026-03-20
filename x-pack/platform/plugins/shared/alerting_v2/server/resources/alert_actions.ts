/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { IlmPolicy } from '@elastic/elasticsearch/lib/api/types';
import { z } from '@kbn/zod';
import type { ResourceDefinition } from './types';
import type { FieldMap } from './field_map';
import { mappingFromFieldMap } from './field_map';

export const ALERT_ACTIONS_DATA_STREAM = '.alerting-actions';
export const ALERT_ACTIONS_DATA_STREAM_VERSION = 1;
export const ALERT_ACTIONS_BACKING_INDEX = '.ds-.alerting-actions-*';
export const ALERT_ACTIONS_ILM_POLICY_NAME = '.alerting-actions-ilm-policy';

export const ALERT_ACTIONS_ILM_POLICY: IlmPolicy = {
  _meta: { managed: true },
  phases: {
    hot: {
      actions: {
        rollover: {
          max_age: '30d',
          max_primary_shard_size: '50gb',
        },
      },
    },
  },
};

/**
 * Single source of truth for alert action document fields.
 * The ES mapping is derived from this FieldMap. The Zod schema below is
 * written explicitly so that TypeScript can infer precise types.
 * A test in field_map.test.ts verifies these stay in sync.
 */
export const alertActionsFieldMap: FieldMap = {
  '@timestamp': { type: 'date', required: true },
  last_series_event_timestamp: { type: 'date', required: true },
  expiry: { type: 'date', required: false },
  actor: { type: 'keyword', required: true },
  action_type: { type: 'keyword', required: true },
  group_hash: { type: 'keyword', required: true },
  episode_id: { type: 'keyword', required: false },
  rule_id: { type: 'keyword', required: true },
  notification_group_id: { type: 'keyword', required: false },
  source: { type: 'keyword', required: false },
  tags: { type: 'keyword', required: false, array: true },
  reason: { type: 'text', required: false },
};

const mappings = mappingFromFieldMap(alertActionsFieldMap);

export const alertActionSchema = z.object({
  '@timestamp': z.string(),
  last_series_event_timestamp: z.string(),
  expiry: z.string().optional(),
  actor: z.string().nullable(),
  action_type: z.string(),
  group_hash: z.string(),
  episode_id: z.string().optional(),
  rule_id: z.string(),
  notification_group_id: z.string().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
  reason: z.string().optional(),
});

export type AlertAction = z.infer<typeof alertActionSchema>;

export const getAlertActionsResourceDefinition = (): ResourceDefinition => ({
  key: `data_stream:${ALERT_ACTIONS_DATA_STREAM}`,
  dataStreamName: ALERT_ACTIONS_DATA_STREAM,
  version: ALERT_ACTIONS_DATA_STREAM_VERSION,
  mappings,
  ilmPolicy: { name: ALERT_ACTIONS_ILM_POLICY_NAME, policy: ALERT_ACTIONS_ILM_POLICY },
});
