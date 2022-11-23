/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiDescriptionList, EuiPageTemplate } from '@elastic/eui';
import React from 'react';
import { Link } from 'react-router-dom';
import { K8sCluster } from '../../common/types_api';

export function K8sClusterInfo({ cluster }: { cluster: K8sCluster }) {
  const list = [
    {
      title: 'Cluster name',
      description: cluster.name,
    },
    {
      title: 'Status',
      description: cluster.status,
    },
    {
      title: 'Version',
      description: cluster.version,
    },
    {
      title: 'Nodes',
      description: (
        <ul>
          {cluster.nodes.map((node) => (
            <li key={node.id}>
              <Link to={`/k8s/nodes/${node.name}`}>{node.name}</Link>
            </li>
          ))}
        </ul>
      ),
    },
  ];
  return (
    <>
      <EuiPageTemplate.Section>
        <EuiDescriptionList listItems={list} />
      </EuiPageTemplate.Section>
    </>
  );
}
