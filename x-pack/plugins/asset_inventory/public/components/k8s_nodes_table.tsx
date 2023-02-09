/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiInMemoryTable, EuiSpacer, EuiText } from '@elastic/eui';
import React from 'react';
import { Link } from 'react-router-dom';
import { K8sNode, K8sPod } from '../../common/types_api';
import { relativeTimeString } from '../lib/relative_time';

export function K8sNodesTable({ isLoading, nodes }: { isLoading?: boolean; nodes?: K8sNode[] }) {
  if (!nodes) {
    return null;
  }

  const columns = [
    {
      field: 'name',
      name: 'Node name',
      sortable: true,
      width: '400px',
      render: (name: string) => {
        return <Link to={`/k8s/node?name=${name}`}>{name}</Link>;
      },
    },
    {
      field: 'pods',
      name: 'Pods',
      width: '150px',
      render: (pods?: K8sPod[]) => <>{pods?.length || 0}</>,
    },
    {
      field: '@timestamp',
      name: 'Last Seen',
      render: (ts: string) => relativeTimeString(new Date(ts)),
    },
  ];

  return (
    <>
      <EuiText>
        <b>Nodes in cluster</b>
      </EuiText>
      <EuiSpacer />
      <EuiInMemoryTable<K8sNode> loading={isLoading} columns={columns} items={nodes} />
    </>
  );
}
