/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import {
  EuiBadge,
  EuiBasicTable,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLink,
  EuiPageHeader,
  EuiSpacer,
  EuiText,
  type EuiBasicTableColumn,
} from '@elastic/eui';
interface FakeWorkflow {
  id: string;
  name: string;
  type: string;
  steps: number;
  linkedPolicies: number;
  lastTriggered: string;
}

const fakeWorkflows: FakeWorkflow[] = [
  { id: 'wf-1', name: 'PagerDuty Escalation', type: 'PagerDuty', steps: 3, linkedPolicies: 1, lastTriggered: '2m ago' },
  { id: 'wf-2', name: 'Slack Notification', type: 'Slack', steps: 1, linkedPolicies: 2, lastTriggered: '10m ago' },
  { id: 'wf-3', name: 'Jira Create Issue', type: 'Jira', steps: 2, linkedPolicies: 1, lastTriggered: '30m ago' },
];

export const WorkflowsPage = () => {
  const columns: Array<EuiBasicTableColumn<FakeWorkflow>> = [
    {
      field: 'name',
      name: 'Name',
      render: (name: string) => <EuiLink>{name}</EuiLink>,
    },
    {
      field: 'type',
      name: 'Type',
      width: '120px',
      render: (type: string) => (
        <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiIcon type="pipelineApp" size="s" />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>{type}</EuiFlexItem>
        </EuiFlexGroup>
      ),
    },
    {
      field: 'steps',
      name: 'Steps',
      width: '80px',
      render: (steps: number) => <EuiBadge color="hollow">{steps}</EuiBadge>,
    },
    {
      field: 'linkedPolicies',
      name: 'Policies',
      width: '80px',
      render: (count: number) => <EuiBadge color="hollow">{count}</EuiBadge>,
    },
    {
      field: 'lastTriggered',
      name: 'Last triggered',
      width: '120px',
      render: (val: string) => (
        <EuiText size="xs" color="subdued">{val}</EuiText>
      ),
    },
  ];

  return (
    <>
      <EuiPageHeader
        pageTitle={
          <EuiFlexGroup alignItems="center" gutterSize="m" responsive={false}>
            <EuiFlexItem grow={false}>Workflows</EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiBadge color="accent">Preview</EuiBadge>
            </EuiFlexItem>
          </EuiFlexGroup>
        }
        description="Workflows are automated sequences of tasks triggered by notification policies. They handle the actual notification delivery and external integrations."
        breadcrumbs={[{ text: 'V2 Alerting Preview' }, { text: 'Workflows' }]}
      />
      <EuiSpacer size="m" />
      <EuiText size="xs" color="subdued">
        Workflows are managed by the Workflows plugin. This view shows workflows
        referenced by your notification policies.
      </EuiText>
      <EuiSpacer size="m" />
      <EuiBasicTable
        items={fakeWorkflows}
        columns={columns}
        itemId="id"
        tableCaption="Workflows"
        responsiveBreakpoint={false}
      />
    </>
  );
};
