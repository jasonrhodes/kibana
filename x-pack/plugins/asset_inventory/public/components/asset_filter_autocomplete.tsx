/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiComboBox, EuiComboBoxOptionOption, EuiFormRow } from '@elastic/eui';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { AssetFilters } from '../../common/types_api';
import { useAssetFilters } from '../hooks/asset_filters';
import { useKibanaUrl } from '../hooks/use_kibana_url';

interface AutocompleteOptions {
  field: string;
  label: string;
  filtersKey: keyof AssetFilters;
  allowMultipleValues?: boolean;
  placeholder?: string;
  fullWidth?: boolean;
}

interface FieldValueResult {
  key: string;
  doc_count: number;
}

export function AssetFilterAutocomplete({
  field,
  label,
  filtersKey,
  allowMultipleValues = false,
  placeholder,
  fullWidth = false,
}: AutocompleteOptions) {
  const [options, setOptions] = useState<EuiComboBoxOptionOption[]>([]);
  const [selected, setSelected] = useState<EuiComboBoxOptionOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { filters, setFilters } = useAssetFilters();
  const apiBaseUrl = useKibanaUrl('/api/asset-inventory/field-values');

  const { collectionVersion } = filters;

  useEffect(() => {
    async function retrieve() {
      setIsLoading(true);
      const response = await axios.get<{ results: FieldValueResult[] }>(
        `${apiBaseUrl}?field=${field}&version=${collectionVersion || 'all'}`
      );

      if (response.data.results) {
        const newOptions: EuiComboBoxOptionOption[] = response.data.results.map((result) => ({
          label: `${result.key} (${result.doc_count})`,
          value: result.key,
        }));
        setOptions(newOptions);
      }
      setIsLoading(false);
    }

    retrieve();
  }, [field, collectionVersion, apiBaseUrl]);

  useEffect(() => {
    const selectedValues = selected.map((option) => option.value);
    const values = allowMultipleValues ? selectedValues : selectedValues[0];
    setFilters((prevFilters) => ({ ...prevFilters, [filtersKey]: values }));
  }, [selected, allowMultipleValues, filtersKey, setFilters]);

  return (
    <EuiFormRow label={label} fullWidth={fullWidth}>
      <EuiComboBox
        options={options}
        selectedOptions={selected}
        isLoading={isLoading}
        singleSelection={allowMultipleValues ? false : { asPlainText: true }}
        onChange={(newOptions) => setSelected(newOptions)}
        placeholder={placeholder}
        fullWidth={fullWidth}
      />
    </EuiFormRow>
  );
}
