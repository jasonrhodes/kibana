/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useEffect, useState } from 'react';
import { EuiIcon, EuiPageTemplate } from '@elastic/eui';
import axios from 'axios';
import { useHistory, useParams } from 'react-router-dom';
import { K8sCluster } from '../../../common/types_api';
import { PageTemplate } from '../../components/page_template';
import { K8sClusterInfo } from '../../components/k8s_cluster_info';

export function K8sClusterPage() {
  const [cluster, setCluster] = useState<K8sCluster | null>(null);
  const { name } = useParams<{ name: string }>();
  const history = useHistory();

  useEffect(() => {
    async function retrieve() {
      const response = await axios.get<any, { data?: { result?: K8sCluster } }>(
        `/local/api/asset-inventory/k8s/clusters/${name}`
      );
      if (response.data && response.data?.result) {
        setCluster(response.data.result);
      }
    }
    retrieve();
  }, [name]);

  if (cluster === null) {
    return null;
  }

  return (
    <PageTemplate>
      <EuiPageTemplate.Header
        pageTitle={cluster.name}
        breadcrumbs={[
          {
            text: (
              <>
                <EuiIcon size="s" type="arrowLeft" /> Return to cluster list
              </>
            ),
            color: 'primary',
            'aria-current': false,
            href: '#',
            onClick: (e) => {
              e.preventDefault();
              history.push('/k8s/clusters');
            },
          },
        ]}
      />
      <EuiPageTemplate.Section>
        <K8sClusterInfo cluster={cluster} />
      </EuiPageTemplate.Section>
    </PageTemplate>
  );
}
