/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export function truncateString(
  string: string | undefined,
  maxChars: number,
  suffix: string = '...'
) {
  if (!string) {
    return '';
  }

  if (string.length <= maxChars) {
    return string;
  }

  return string.substring(0, maxChars) + suffix;
}

export function truncateAssetName(title: string | undefined) {
  return truncateString(title, 30);
}
