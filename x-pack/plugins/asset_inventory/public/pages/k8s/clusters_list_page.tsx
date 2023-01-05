/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { EuiButton, EuiCallOut, EuiLoadingSpinner, EuiPageTemplate } from '@elastic/eui';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { LoadResults } from '@elastic/asset-collection/dist/lib/shared/types';
import { K8sCluster } from '../../../common/types_api';
import { PageTemplate } from '../../components/page_template';
import { K8sClustersTable } from '../../components/k8s_clusters_table';
import { useKibanaUrl } from '../../hooks/use_kibana_url';

export function K8sClustersListPage() {
  const [clusters, setClusters] = useState<K8sCluster[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCollecting, setIsCollecting] = useState<boolean>(false);
  const [collectionResponse, setCollectionResponse] = useState<LoadResults | null>(null);
  const [collectionError, setCollectionError] = useState<string>('');
  const history = useHistory();
  const apiBaseUrl = useKibanaUrl('/api/asset-inventory');

  useEffect(() => {
    async function retrieve() {
      if (isCollecting) {
        return;
      }
      setIsLoading(true);
      const response = await axios.get<any, { data?: { results?: K8sCluster[] } }>(
        apiBaseUrl + '/k8s/clusters'
      );
      if (response.data && response.data?.results) {
        setClusters(response.data.results);
      }
      setIsLoading(false);
    }
    retrieve();
  }, [apiBaseUrl, isCollecting]);

  const handleLoadAssets = useCallback(async () => {
    setCollectionError('');
    setIsCollecting(true);
    try {
      const results = await axios.post<LoadResults>(
        apiBaseUrl + '/collect',
        { types: ['all'] },
        {
          headers: { 'kbn-xsrf': 'abcdefghijkl' },
        }
      );
      setCollectionResponse(results.data);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message;
      setCollectionError(
        typeof message === 'string' ? message : 'Unknown error occurred while collecting asset data'
      );
    }
    setIsCollecting(false);
  }, [apiBaseUrl]);

  return (
    <PageTemplate>
      <EuiPageTemplate.Header
        pageTitle="Kubernetes inventory"
        rightSideItems={[
          <EuiButton onClick={handleLoadAssets} disabled={isCollecting}>
            {isCollecting ? (
              <>
                Collecting... <EuiLoadingSpinner />
              </>
            ) : (
              'Collect Kubernetes Asset Data'
            )}
          </EuiButton>,
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
        <CollectionMessage
          isCollecting={isCollecting}
          response={collectionResponse}
          error={collectionError}
          timeoutMs={10000}
        />
        <K8sClustersTable isLoading={isLoading} clusters={clusters} />
      </EuiPageTemplate.Section>
    </PageTemplate>
  );
}

interface CollectionMessageProps {
  isCollecting: boolean;
  response: LoadResults | null;
  error: string;
  timeoutMs: number;
}

function CollectionMessage({ isCollecting, response, error, timeoutMs }: CollectionMessageProps) {
  const [show, setShow] = useState<boolean>(false);
  const [showTimeout, setShowTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (showTimeout) {
      clearTimeout(showTimeout);
    }
    setShow(true);
    const t = setTimeout(() => setShow(false), timeoutMs);
    setShowTimeout(t);
  }, [isCollecting, response, error, showTimeout, timeoutMs]);

  if (!show) {
    return null;
  }

  if (isCollecting) {
    return null;
  }

  if (error) {
    return (
      <EuiCallOut title="Collection Failed" color="danger">
        {error}
      </EuiCallOut>
    );
  }

  if (response) {
    return (
      <EuiCallOut title="Collection Succeeded" color="success" iconType="checkInCircleFilled" />
    );
  }

  return null;
}
