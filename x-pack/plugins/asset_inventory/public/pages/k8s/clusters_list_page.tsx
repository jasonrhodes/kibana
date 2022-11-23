/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useEffect, useState } from 'react';
import { EuiButton, EuiPageTemplate } from '@elastic/eui';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { K8sCluster } from '../../../common/types_api';
import { PageTemplate } from '../../components/page_template';
import { K8sClustersTable } from '../../components/k8s_clusters_table';

export function K8sClustersListPage() {
  const [clusters, setClusters] = useState<K8sCluster[]>([]);
  const history = useHistory();

  useEffect(() => {
    async function retrieve() {
      const response = await axios.get<any, { data?: { results?: K8sCluster[] } }>(
        `/local/api/asset-inventory/k8s/clusters`
      );
      if (response.data && response.data?.results) {
        setClusters(response.data.results);
      }
    }
    retrieve();
  }, []);

  return (
    <PageTemplate>
      <EuiPageTemplate.Header
        pageTitle="Kubernetes inventory"
        rightSideItems={[
          <EuiButton
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              history.push('/');
            }}
          >
            Asset Inventory
          </EuiButton>,
        ]}
      />
      <EuiPageTemplate.Section>
        <K8sClustersTable clusters={clusters} />
      </EuiPageTemplate.Section>
    </PageTemplate>
  );
}
