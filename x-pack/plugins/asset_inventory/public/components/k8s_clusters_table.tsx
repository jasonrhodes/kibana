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
import { AssetStatus, K8sCluster, K8sNode } from '../../common/types_api';
import { cloudIconMap, statusMap } from '../constants';
import { relativeTimeString } from '../lib/relative_time';

export function K8sClustersTable({
  isLoading,
  clusters,
}: {
  isLoading: boolean;
  clusters: K8sCluster[];
}) {
  const columns = [
    {
      field: 'name',
      name: 'Cluster name',
      sortable: true,
      width: '400px',
      render: (name: string) => {
        return <Link to={`/k8s/cluster?name=${name}`}>{name}</Link>;
      },
    },
    {
      field: 'status',
      name: 'Latest Status',
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
    {
      field: '@timestamp',
      name: 'Last Seen',
      render: (ts: string) => relativeTimeString(new Date(ts)),
    },
  ];

  // @ts-ignore
  return <EuiInMemoryTable loading={isLoading} columns={columns} items={clusters} />;
}
