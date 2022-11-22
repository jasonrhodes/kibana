/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useContext, useState, useEffect } from 'react';
import { AssetFilters } from '../../common/types_api';
import { convertAssetFiltersToQueryString } from '../lib/convert_asset_filters_to_query_string';

export type FilterSetter = React.Dispatch<React.SetStateAction<AssetFilters>>;

export interface AssetFilterContextValue {
  filters: AssetFilters;
  setFilters: FilterSetter;
  filtersQS: string;
}

const AssetFilterContext = React.createContext<AssetFilterContextValue>({
  filters: {},
  setFilters: () => null,
  filtersQS: '',
});

const AssetFilterContextConsumer = AssetFilterContext.Consumer;

const AssetFilterContextProvider: React.FC<{}> = ({ children }) => {
  const [filters, setFilters] = useState<AssetFilters>({});
  const [filtersQS, setFiltersQS] = useState<string>('');

  useEffect(() => {
    setFiltersQS(convertAssetFiltersToQueryString(filters));
  }, [filters]);

  return (
    <AssetFilterContext.Provider
      value={{
        filters,
        setFilters,
        filtersQS,
      }}
    >
      {children}
    </AssetFilterContext.Provider>
  );
};

const useAssetFilters = () => {
  return useContext(AssetFilterContext);
};

export {
  AssetFilterContext,
  AssetFilterContextProvider,
  AssetFilterContextConsumer,
  useAssetFilters,
};
