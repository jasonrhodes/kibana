/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiDescriptionList, EuiLoadingChart, EuiPageTemplate, EuiSpacer } from '@elastic/eui';
import React from 'react';
import { K8sNode } from '../../common/types_api';
import { K8sPodsTable } from './k8s_pods_table';

export function K8sNodeInfo({ node }: { node: K8sNode | null }) {
  if (node === null) {
    return (
      <>
        <EuiPageTemplate.Section>
          <EuiLoadingChart size="xl" mono />
        </EuiPageTemplate.Section>
      </>
    );
  }

  const list: Array<{ title: string; description: React.ReactChild }> = [
    {
      title: 'Node name',
      description: node.name || '',
    },
    {
      title: 'Node UID',
      description: node.id || '',
    },
  ];

  return (
    <>
      <EuiPageTemplate.Section>
        <EuiDescriptionList listItems={list} />
        <EuiSpacer />
        <K8sPodsTable pods={node.pods} />
      </EuiPageTemplate.Section>
    </>
  );
}
