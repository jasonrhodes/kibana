/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiHealth, EuiIcon, EuiInMemoryTable } from '@elastic/eui';
import { capitalize } from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import { AssetStatus, CloudProviderName, K8sCluster, K8sNode } from '../../common/types_api';

const cloudIconMap: Record<CloudProviderName, string> = {
  gcp: 'logoGCP',
  aws: 'logoAWS',
  azure: 'logoAzure',
  other: 'questionInCircle',
  unknown: 'questionInCircle',
  none: 'crossInACircleFilled',
};

const statusMap: Record<AssetStatus, string> = {
  ACTIVE: 'success',
  CREATING: 'subdued',
  DELETING: 'subdued',
  FAILED: 'danger',
  UPDATING: 'subdued',
  PENDING: 'warning',
};

export function K8sClustersTable({ clusters }: { clusters: K8sCluster[] }) {
  const columns = [
    {
      field: 'name',
      name: 'Cluster name',
      sortable: true,
      width: '400px',
      render: (name: string) => {
        return <Link to={`/k8s/clusters/${name}`}>{name}</Link>;
      },
    },
    {
      field: 'status',
      name: 'Status',
      render: (status: AssetStatus) => (
        <EuiHealth color={statusMap[status]}>{capitalize(status)}</EuiHealth>
      ),
    },
    {
      field: 'cloud',
      name: 'Provider',
      render: (cloud: K8sCluster['cloud']) => (
        <EuiIcon size="xl" type={cloudIconMap[cloud?.provider || 'unknown']} />
      ),
    },
    {
      field: 'cloud',
      name: 'Region',
      render: (cloud: K8sCluster['cloud']) => cloud?.region || 'unknown',
    },
    {
      field: 'version',
      name: 'Version',
    },
    {
      field: 'nodes',
      name: 'Nodes',
      render: (nodes: K8sNode[]) => <>{nodes.length}</>,
    },
  ];

  // @ts-ignore
  return <EuiInMemoryTable columns={columns} items={clusters} />;
}
