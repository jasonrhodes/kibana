/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { zodSchemaFromFieldMap } from './zod_schema_from_field_map';
import type { FieldMap } from './types';

describe('zodSchemaFromFieldMap', () => {
  it('creates a schema with required and optional fields', () => {
    const fieldMap: FieldMap = {
      '@timestamp': { type: 'date', required: true },
      reason: { type: 'text', required: false },
    };

    const schema = zodSchemaFromFieldMap(fieldMap);
    expect(schema.safeParse({ '@timestamp': '2026-01-01T00:00:00Z' }).success).toBe(true);
    expect(schema.safeParse({}).success).toBe(false);
    expect(schema.safeParse({ '@timestamp': '2026-01-01T00:00:00Z', reason: 'test' }).success).toBe(
      true
    );
  });

  it('handles array fields', () => {
    const fieldMap: FieldMap = {
      tags: { type: 'keyword', required: false, array: true },
    };

    const schema = zodSchemaFromFieldMap(fieldMap);
    expect(schema.safeParse({}).success).toBe(true);
    expect(schema.safeParse({ tags: ['a', 'b'] }).success).toBe(true);
    expect(schema.safeParse({ tags: 'not-an-array' }).success).toBe(false);
  });

  it('expands dotted paths into nested objects', () => {
    const fieldMap: FieldMap = {
      'rule.id': { type: 'keyword', required: true },
      'rule.version': { type: 'long', required: true },
    };

    const schema = zodSchemaFromFieldMap(fieldMap);
    expect(schema.safeParse({ rule: { id: 'r1', version: 1 } }).success).toBe(true);
    expect(schema.safeParse({ rule: { id: 'r1' } }).success).toBe(false);
    expect(schema.safeParse({}).success).toBe(false);
  });

  it('handles mixed required/optional nested fields', () => {
    const fieldMap: FieldMap = {
      'episode.id': { type: 'keyword', required: true },
      'episode.status': { type: 'keyword', required: true },
      'episode.status_count': { type: 'long', required: false },
    };

    const schema = zodSchemaFromFieldMap(fieldMap);
    expect(schema.safeParse({ episode: { id: 'e1', status: 'active' } }).success).toBe(true);
    expect(
      schema.safeParse({ episode: { id: 'e1', status: 'active', status_count: 3 } }).success
    ).toBe(true);
    expect(schema.safeParse({ episode: { id: 'e1' } }).success).toBe(false);
  });

  it('maps ES types to appropriate Zod types', () => {
    const fieldMap: FieldMap = {
      name: { type: 'keyword', required: true },
      count: { type: 'long', required: true },
      enabled: { type: 'boolean', required: true },
      created_at: { type: 'date', required: true },
    };

    const schema = zodSchemaFromFieldMap(fieldMap);
    expect(
      schema.safeParse({ name: 'test', count: 42, enabled: true, created_at: '2026-01-01' }).success
    ).toBe(true);
    expect(
      schema.safeParse({ name: 123, count: 42, enabled: true, created_at: '2026-01-01' }).success
    ).toBe(false);
  });
});
