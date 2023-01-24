/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useEffect, useState } from 'react';
import { EuiIcon, EuiPageTemplate } from '@elastic/eui';
import axios from 'axios';
import { useHistory, useLocation } from 'react-router-dom';
import { EuiBreadcrumbProps } from '@elastic/eui/src/components/breadcrumbs/breadcrumb';
import { K8sNode } from '../../../common/types_api';
import { PageTemplate } from '../../components/page_template';
import { useKibanaUrl } from '../../hooks/use_kibana_url';
import { K8sNodeInfo } from '../../components/k8s_node_info';
import { truncateAssetName } from '../../lib/truncate_string';

interface QueryStringAccessor<T extends object> {
  get: (key: keyof T) => string;
}

function useQuery<T extends object>() {
  const { search } = useLocation();
  // console.log('accessing search params', search);
  return React.useMemo(() => new URLSearchParams(search), [search]) as QueryStringAccessor<T>;
}

function useSearchParam<T extends object>(key: keyof T) {
  const querystring = useQuery<T>();
  return React.useMemo(() => querystring.get(key), [querystring, key]);
}

export function K8sNodePage() {
  const [node, setNode] = useState<K8sNode | null>(null);
  const nodeName = useSearchParam<{ name?: string }>('name');
  const history = useHistory();
  const apiBaseUrl = useKibanaUrl('/api/asset-inventory/k8s/node');

  useEffect(() => {
    async function retrieve() {
      if (!nodeName) {
        return;
      }
      const response = await axios.get<any, { data?: { result?: K8sNode } }>(
        `${apiBaseUrl}?name=${nodeName}`
      );
      if (response.data && response.data?.result) {
        setNode(response.data.result);
      }
    }
    retrieve();
  }, [nodeName, apiBaseUrl]);

  if (!nodeName) {
    history.push('/k8s/clusters');
    return null;
  }

  const clusterName = node?.cluster?.name;

  const breadcrumbs: EuiBreadcrumbProps[] | undefined = clusterName
    ? [
        {
          text: (
            <>
              <EuiIcon size="s" type="arrowLeft" /> Return to cluster{' '}
              {truncateAssetName(clusterName)}
            </>
          ),
          color: 'primary',
          'aria-current': false,
          href: '#',
          onClick: (e) => {
            e.preventDefault();
            const path = clusterName ? `/k8s/cluster?name=${clusterName}` : '/k8s/clusters';
            history.push(path);
          },
        },
      ]
    : undefined;

  return (
    <PageTemplate>
      <EuiPageTemplate.Header
        pageTitle={
          <span title={nodeName}>Node Overview ({truncateAssetName(clusterName || '...')})</span>
        }
        breadcrumbs={breadcrumbs}
      />
      <EuiPageTemplate.Section>
        <K8sNodeInfo node={node} />
      </EuiPageTemplate.Section>
    </PageTemplate>
  );
}
