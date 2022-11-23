/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiInMemoryTable } from '@elastic/eui';
import React from 'react';
import { Link } from 'react-router-dom';
import { K8sCluster, K8sNode } from '../../common/types_api';

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
    },
    {
      field: 'name',
      name: 'Provider',
      render: () => <>GCP</>,
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
