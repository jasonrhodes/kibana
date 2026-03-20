/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { set } from '@kbn/safer-lodash-set';
import type { MappingsDefinition } from '@kbn/es-mappings';
import type { FieldMap } from './types';

/**
 * Derives an ES MappingsDefinition from a FieldMap.
 * Dotted paths are expanded into nested `properties` objects.
 */
export function mappingFromFieldMap(
  fieldMap: FieldMap,
  dynamic: 'strict' | boolean = false
): MappingsDefinition {
  const properties = {} as MappingsDefinition['properties'];

  for (const [key, field] of Object.entries(fieldMap)) {
    const { required: _required, array: _array, ...mappingProps } = field;
    const path = key.split('.').join('.properties.');
    set(properties, path, mappingProps);
  }

  return { dynamic, properties };
}
