/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { EuiFormRow, EuiSelect, EuiSelectOption, useGeneratedHtmlId } from '@elastic/eui';
import React from 'react';
import { AssetFilters } from '../../common/types_api';
import { useAssetFilters } from '../hooks/asset_filters';

interface FilterSelectBoxOptions {
  options: Array<EuiSelectOption | string>;
  label?: string;
  filterKey: keyof AssetFilters;
  value: string | undefined;
}

export function AssetFilterSelectBox({
  value = '',
  options,
  label,
  filterKey,
}: FilterSelectBoxOptions) {
  const basicSelectId = useGeneratedHtmlId({ prefix: 'asset-filter-select_' });
  const { setFilters } = useAssetFilters();

  const euiSelectOptions = options.map((option) => {
    if (typeof option === 'string') {
      return { value: option, text: option };
    } else {
      return option;
    }
  });

  return (
    <EuiFormRow label={label}>
      <EuiSelect
        id={basicSelectId}
        value={value}
        options={euiSelectOptions}
        onChange={(e) => {
          setFilters((filters) => ({ ...filters, [filterKey]: e.target.value }));
        }}
      />
    </EuiFormRow>
  );
}
