/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { AssetFilters } from '../../common/types_api';

export function convertAssetFiltersToQueryString(filters: AssetFilters) {
  const keys = Object.keys(filters) as unknown as Array<keyof AssetFilters>;
  const definedKeys = keys.filter((k) => typeof filters[k] !== 'undefined');
  return definedKeys.map((k) => `${k}=${filters[k]}`).join('&');
}
