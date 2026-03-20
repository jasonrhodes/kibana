/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { z, type ZodTypeAny } from '@kbn/zod';
import type { FieldMap } from './types';

/**
 * Maps ES field types to base Zod types.
 */
function zodTypeForEsType(esType: string): ZodTypeAny {
  switch (esType) {
    case 'keyword':
    case 'text':
    case 'match_only_text':
    case 'wildcard':
    case 'constant_keyword':
    case 'ip':
    case 'version':
    case 'date':
      return z.string();
    case 'long':
    case 'integer':
    case 'short':
    case 'byte':
    case 'float':
    case 'double':
    case 'scaled_float':
      return z.number();
    case 'boolean':
      return z.boolean();
    case 'flattened':
    case 'object':
      return z.record(z.string(), z.any());
    default:
      return z.unknown();
  }
}

interface TreeNode {
  field?: { type: string; required: boolean; array?: boolean };
  children: Record<string, TreeNode>;
}

/**
 * Builds an intermediate tree from dotted field paths.
 * e.g. { 'rule.id': ..., 'rule.version': ... } becomes a tree with
 * a 'rule' node containing 'id' and 'version' children.
 */
function buildFieldTree(fieldMap: FieldMap): TreeNode {
  const root: TreeNode = { children: {} };

  for (const [key, entry] of Object.entries(fieldMap)) {
    const parts = key.split('.');
    let node = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!node.children[part]) {
        node.children[part] = { children: {} };
      }
      node = node.children[part];
    }

    node.field = entry;
  }

  return root;
}

/**
 * Recursively converts a tree node into a Zod type.
 * Leaf nodes become scalar/array types; branch nodes become z.object().
 */
function zodTypeFromNode(node: TreeNode): { schema: ZodTypeAny; required: boolean } {
  if (node.field && Object.keys(node.children).length === 0) {
    let base = zodTypeForEsType(node.field.type);
    if (node.field.array) {
      base = z.array(base);
    }
    return { schema: base, required: node.field.required };
  }

  const shape: Record<string, ZodTypeAny> = {};
  const requiredKeys = new Set<string>();

  for (const [key, child] of Object.entries(node.children)) {
    const { schema: childSchema, required: childRequired } = zodTypeFromNode(child);
    shape[key] = childRequired ? childSchema : childSchema.optional();
    if (childRequired) {
      requiredKeys.add(key);
    }
  }

  const objectSchema = z.object(shape);
  const isRequired =
    node.field?.required ?? Object.keys(node.children).some((k) => requiredKeys.has(k));

  return { schema: objectSchema, required: isRequired };
}

/**
 * Derives a Zod object schema from a FieldMap.
 *
 * Dotted paths are expanded into nested z.object() structures.
 * Fields with `required: false` become `.optional()`.
 * Fields with `array: true` become `z.array()`.
 *
 * @example
 * ```ts
 * const fieldMap = {
 *   '@timestamp': { type: 'date', required: true },
 *   'tags': { type: 'keyword', required: false, array: true },
 *   'rule.id': { type: 'keyword', required: true },
 * };
 * const schema = zodSchemaFromFieldMap(fieldMap);
 * // Equivalent to:
 * // z.object({
 * //   '@timestamp': z.string(),
 * //   tags: z.array(z.string()).optional(),
 * //   rule: z.object({ id: z.string() }),
 * // })
 * ```
 */
export function zodSchemaFromFieldMap(fieldMap: FieldMap): z.ZodObject<Record<string, ZodTypeAny>> {
  const tree = buildFieldTree(fieldMap);
  const shape: Record<string, ZodTypeAny> = {};

  for (const [key, child] of Object.entries(tree.children)) {
    const { schema, required } = zodTypeFromNode(child);
    shape[key] = required ? schema : schema.optional();
  }

  return z.object(shape);
}
