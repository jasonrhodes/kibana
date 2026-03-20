/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { mappingFromFieldMap } from './mapping_from_field_map';
import type { FieldMap } from './types';

describe('mappingFromFieldMap', () => {
  it('creates flat mappings from a field map', () => {
    const fieldMap: FieldMap = {
      '@timestamp': { type: 'date', required: true },
      action_type: { type: 'keyword', required: true },
      reason: { type: 'text', required: false },
    };

    const result = mappingFromFieldMap(fieldMap);
    expect(result).toEqual({
      dynamic: false,
      properties: {
        '@timestamp': { type: 'date' },
        action_type: { type: 'keyword' },
        reason: { type: 'text' },
      },
    });
  });

  it('strips required and array from mapping output', () => {
    const fieldMap: FieldMap = {
      tags: { type: 'keyword', required: false, array: true },
    };

    const result = mappingFromFieldMap(fieldMap);
    expect(result.properties).toEqual({
      tags: { type: 'keyword' },
    });
  });

  it('expands dotted paths into nested properties', () => {
    const fieldMap: FieldMap = {
      'rule.id': { type: 'keyword', required: true },
      'rule.version': { type: 'long', required: true },
    };

    const result = mappingFromFieldMap(fieldMap);
    expect(result.properties).toEqual({
      rule: {
        properties: {
          id: { type: 'keyword' },
          version: { type: 'long' },
        },
      },
    });
  });

  it('uses the provided dynamic setting', () => {
    const fieldMap: FieldMap = {
      '@timestamp': { type: 'date', required: true },
    };

    expect(mappingFromFieldMap(fieldMap, 'strict').dynamic).toBe('strict');
    expect(mappingFromFieldMap(fieldMap, false).dynamic).toBe(false);
    expect(mappingFromFieldMap(fieldMap).dynamic).toBe(false);
  });
});
