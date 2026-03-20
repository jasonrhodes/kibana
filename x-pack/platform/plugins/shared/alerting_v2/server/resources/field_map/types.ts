/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/**
 * Field definition within a FieldMap. Each entry describes a single field
 * with its ES mapping type, whether it's required in the document schema,
 * and whether it's an array.
 */
export interface FieldMapEntry {
  type: string;
  required: boolean;
  array?: boolean;
}

/**
 * A flat dictionary mapping dotted field paths to their definitions.
 * Dotted paths like 'rule.id' represent nested objects.
 *
 * This serves as the single source of truth from which both ES mappings
 * and Zod document schemas are derived.
 */
export type FieldMap = Record<string, FieldMapEntry>;
