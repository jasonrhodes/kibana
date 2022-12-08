/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useEffect, useState } from 'react';
import { EuiButton, EuiPageTemplate, EuiSpacer } from '@elastic/eui';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { PageTemplate } from '../components/page_template';
import { Asset } from '../../common/types_api';
import { AssetsTable } from '../components/assets_table';
import { AssetFilterControls } from '../components/asset_filter_controls';
import { useAssetFilters } from '../hooks/asset_filters';
import { useKibanaUrl } from '../hooks/use_kibana_url';

export function AssetInventoryListPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const { filtersQS } = useAssetFilters();
  const history = useHistory();
  const apiBaseUrl = useKibanaUrl('/api/asset-inventory');

  useEffect(() => {
    async function retrieve() {
      const path = `${apiBaseUrl}?${filtersQS}`;
      const response = await axios.get(path);
      if (response.data && response.data.assets) {
        setAssets(response.data.assets);
      }
    }
    retrieve();
  }, [filtersQS, apiBaseUrl]);

  return (
    <PageTemplate>
      <EuiPageTemplate.Header
        pageTitle="Asset Inventory List"
        rightSideItems={[
          <EuiButton
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              history.push('/k8s/clusters');
            }}
          >
            K8s Clusters
          </EuiButton>,
        ]}
      />
      <EuiPageTemplate.Section>
        <AssetFilterControls />
        <EuiSpacer size="l" />
        <AssetsTable assets={assets} />
      </EuiPageTemplate.Section>
    </PageTemplate>
  );
}
