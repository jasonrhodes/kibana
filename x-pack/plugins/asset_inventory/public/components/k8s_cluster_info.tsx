/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiDescriptionList, EuiHealth, EuiIcon, EuiPageTemplate, EuiSpacer } from '@elastic/eui';
import { capitalize } from 'lodash';
import React from 'react';
import { K8sCluster } from '../../common/types_api';
import { cloudIconMap, statusMap } from '../constants';
import { K8sNodesTable } from './k8s_nodes_table';

export function K8sClusterInfo({ cluster }: { cluster: K8sCluster }) {
  const list: Array<{ title: string; description: React.ReactChild }> = [
    {
      title: 'Cluster name',
      description: cluster.name || '',
    },
    {
      title: 'Status',
      description: (
        <EuiHealth color={statusMap[cluster.status || 'UNKNOWN']}>
          {capitalize(cluster.status)}
        </EuiHealth>
      ),
    },
    {
      title: 'Version',
      description: cluster.version || '',
    },
    // {
    //   title: 'Nodes',
    //   description: (
    //     <ul>
    //       {nodes.map((node) => (
    //         <li key={node.id}>
    //           <Link to={`/k8s/nodes/${node.name}`}>{node.name}</Link>
    //         </li>
    //       ))}
    //     </ul>
    //   ),
    // },
  ];

  if (cluster.cloud?.provider) {
    list.push({
      title: 'Cloud Provider',
      description: <EuiIcon size="xl" type={cloudIconMap[cluster.cloud.provider]} />,
    });
  }

  if (cluster.cloud?.region) {
    list.push({
      title: 'Cloud Region',
      description: cluster.cloud.region,
    });
  }

  return (
    <>
      <EuiPageTemplate.Section>
        <EuiDescriptionList listItems={list} />
        <EuiSpacer />
        <K8sNodesTable nodes={cluster.nodes} />
      </EuiPageTemplate.Section>
    </>
  );
}
