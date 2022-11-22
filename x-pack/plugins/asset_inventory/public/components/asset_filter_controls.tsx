/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { AssetFilterAutocomplete } from './asset_filter_autocomplete';

export function AssetFilterControls() {
  return (
    <>
      <EuiFlexGroup wrap>
        <EuiFlexItem>
          <AssetFilterAutocomplete
            label="Kind"
            field="asset.kind.keyword"
            filtersKey="kind"
            placeholder="All kinds"
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <AssetFilterAutocomplete
            label="Type"
            field="asset.type.keyword"
            filtersKey="type"
            placeholder="All types"
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <AssetFilterAutocomplete
            label="Version"
            field="asset.collection_version"
            filtersKey="collectionVersion"
            placeholder="Show data from all collection versions"
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiFlexGroup>
        <EuiFlexItem css={{ minWidth: '50%' }}>
          <AssetFilterAutocomplete
            label="EAN"
            field="asset.ean.keyword"
            filtersKey="ean"
            placeholder="Filter by EAN"
            fullWidth={true}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <AssetFilterAutocomplete
            label="Original ID"
            field="asset.id.keyword"
            filtersKey="id"
            placeholder="Filter by original ID"
            fullWidth={true}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}
