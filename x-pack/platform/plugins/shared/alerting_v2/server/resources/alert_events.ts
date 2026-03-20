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
import { mappingFromFieldMap, zodSchemaFromFieldMap } from './field_map';

export const ALERT_EVENTS_DATA_STREAM = '.alerting-events';
export const ALERT_EVENTS_DATA_STREAM_VERSION = 1;
export const ALERT_EVENTS_BACKING_INDEX = '.ds-.alerting-events-*';
export const ALERT_EVENTS_ILM_POLICY_NAME = '.alerting-events-ilm-policy';

export const ALERT_EVENTS_ILM_POLICY: IlmPolicy = {
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
 * Single source of truth for alert event document fields.
 * Both the ES mapping and Zod schema are derived from this.
 */
export const alertEventsFieldMap: FieldMap = {
  '@timestamp': { type: 'date', required: true },
  scheduled_timestamp: { type: 'date', required: false },
  'rule.id': { type: 'keyword', required: true },
  'rule.version': { type: 'long', required: true },
  group_hash: { type: 'keyword', required: true },
  data: { type: 'flattened', required: true },
  status: { type: 'keyword', required: true },
  source: { type: 'keyword', required: true },
  type: { type: 'keyword', required: true },
  'episode.id': { type: 'keyword', required: true },
  'episode.status': { type: 'keyword', required: true },
  'episode.status_count': { type: 'long', required: false },
};

const mappings = mappingFromFieldMap(alertEventsFieldMap);

const baseSchema = zodSchemaFromFieldMap(alertEventsFieldMap);

const alertEventStatusSchema = z.enum(['breached', 'recovered', 'no_data']);
const alertEventTypeSchema = z.enum(['signal', 'alert']);
const alertEpisodeStatusSchema = z.enum(['inactive', 'pending', 'active', 'recovering']);

export const alertEventStatus = alertEventStatusSchema.enum;
export const alertEventType = alertEventTypeSchema.enum;
export const alertEpisodeStatus = alertEpisodeStatusSchema.enum;

/**
 * Zod schema for alert event documents, with enum refinements that go
 * beyond what the FieldMap can express.
 */
export const alertEventSchema = baseSchema.extend({
  status: alertEventStatusSchema,
  type: alertEventTypeSchema,
  episode: z
    .object({
      id: z.string(),
      status: alertEpisodeStatusSchema,
      status_count: z.number().int().optional(),
    })
    .optional(),
});

export type AlertEvent = z.infer<typeof alertEventSchema>;
export type AlertEventStatus = z.infer<typeof alertEventStatusSchema>;
export type AlertEventType = z.infer<typeof alertEventTypeSchema>;
export type AlertEpisodeStatus = z.infer<typeof alertEpisodeStatusSchema>;

export const getAlertEventsResourceDefinition = (): ResourceDefinition => ({
  key: `data_stream:${ALERT_EVENTS_DATA_STREAM}`,
  dataStreamName: ALERT_EVENTS_DATA_STREAM,
  version: ALERT_EVENTS_DATA_STREAM_VERSION,
  mappings,
  ilmPolicy: { name: ALERT_EVENTS_ILM_POLICY_NAME, policy: ALERT_EVENTS_ILM_POLICY },
});
