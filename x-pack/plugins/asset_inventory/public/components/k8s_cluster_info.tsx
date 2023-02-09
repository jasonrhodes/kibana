/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiHealth, EuiIcon, EuiPageTemplate } from '@elastic/eui';
import { capitalize } from 'lodash';
import React from 'react';
import { K8sCluster } from '../../common/types_api';
import { cloudIconMap, statusMap } from '../constants';
import { CustomDescriptionList, DLItem } from './custom_description_list';
import { K8sNodesTable } from './k8s_nodes_table';
import { SectionRule } from './section_rule';

export function K8sClusterInfo({ cluster }: { cluster: K8sCluster }) {
  const list: DLItem[] = [
    {
      title: 'Cluster name',
      description: cluster.name,
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
      description: cluster.version,
    },
    {
      title: '',
      description: '',
    },
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
        <CustomDescriptionList items={list} />
        <SectionRule />
        <K8sNodesTable nodes={cluster.nodes} />
      </EuiPageTemplate.Section>
    </>
  );
}
