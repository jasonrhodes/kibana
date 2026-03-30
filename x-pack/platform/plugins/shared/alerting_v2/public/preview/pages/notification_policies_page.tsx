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
  EuiButton,
  EuiCode,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHealth,
  EuiIcon,
  EuiLink,
  EuiPageHeader,
  EuiSpacer,
  EuiText,
  EuiToolTip,
  type EuiBasicTableColumn,
} from '@elastic/eui';
import { useHistory } from 'react-router-dom';

interface FakePolicy {
  id: string;
  name: string;
  enabled: boolean;
  snoozed: boolean;
  matcher: string;
  groupBy: string;
  throttle: string;
  workflow: string;
  linkedRules: number;
  lastDispatched: string;
}

const fakePolicies: FakePolicy[] = [
  { id: 'np-1', name: 'Critical PagerDuty', enabled: true, snoozed: false, matcher: 'severity: critical', groupBy: 'service', throttle: '5m', workflow: 'PagerDuty Escalation', linkedRules: 5, lastDispatched: '2m ago' },
  { id: 'np-2', name: 'Slack #ops-alerts', enabled: true, snoozed: false, matcher: '', groupBy: 'host.name', throttle: '15m', workflow: 'Slack Notification', linkedRules: 8, lastDispatched: '10m ago' },
  { id: 'np-3', name: 'Email digest — daily', enabled: true, snoozed: true, matcher: 'severity: low OR severity: warning', groupBy: '', throttle: '24h', workflow: 'Email Digest', linkedRules: 3, lastDispatched: '1d ago' },
  { id: 'np-4', name: 'Jira ticket creation', enabled: true, snoozed: false, matcher: 'labels: "business"', groupBy: 'service', throttle: '1h', workflow: 'Jira Create Issue', linkedRules: 2, lastDispatched: '30m ago' },
  { id: 'np-5', name: 'Teams channel — infra', enabled: false, snoozed: false, matcher: 'labels: "infra"', groupBy: '', throttle: '10m', workflow: 'Teams Notification', linkedRules: 4, lastDispatched: '2h ago' },
];

export const NotificationPoliciesPage = () => {
  const history = useHistory();

  const columns: Array<EuiBasicTableColumn<FakePolicy>> = [
    {
      field: 'name',
      name: 'Name',
      render: (name: string, policy: FakePolicy) => (
        <EuiLink onClick={() => history.push(`/${policy.id}`)}>
          {name}
        </EuiLink>
      ),
    },
    {
      field: 'enabled',
      name: 'State',
      width: '90px',
      render: (enabled: boolean, policy: FakePolicy) => {
        if (!enabled) return <EuiHealth color="subdued">Disabled</EuiHealth>;
        if (policy.snoozed) return <EuiHealth color="warning">Snoozed</EuiHealth>;
        return <EuiHealth color="success">Enabled</EuiHealth>;
      },
    },
    {
      field: 'matcher',
      name: 'Matcher',
      width: '200px',
      render: (matcher: string) =>
        matcher ? (
          <EuiCode transparentBackground>{matcher}</EuiCode>
        ) : (
          <EuiToolTip content="Matches all episodes">
            <EuiBadge color="hollow">catch-all</EuiBadge>
          </EuiToolTip>
        ),
    },
    {
      field: 'groupBy',
      name: 'Group by',
      width: '120px',
      render: (groupBy: string) =>
        groupBy ? (
          <EuiCode transparentBackground>{groupBy}</EuiCode>
        ) : (
          <EuiText size="xs" color="subdued">per episode</EuiText>
        ),
    },
    {
      field: 'throttle',
      name: 'Throttle',
      width: '80px',
    },
    {
      field: 'workflow',
      name: 'Workflow',
      width: '170px',
      render: (workflow: string) => (
        <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiIcon type="pipelineApp" size="s" />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText size="xs">{workflow}</EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      ),
    },
    {
      field: 'linkedRules',
      name: 'Rules',
      width: '70px',
      render: (count: number) => <EuiBadge color="hollow">{count}</EuiBadge>,
    },
    {
      field: 'lastDispatched',
      name: 'Last dispatched',
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
            <EuiFlexItem grow={false}>Notification Policies</EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiBadge color="accent">Preview</EuiBadge>
            </EuiFlexItem>
          </EuiFlexGroup>
        }
        description="Notification policies control how alert episodes reach your team — match, group, throttle, then route to a workflow."
        rightSideItems={[
          <EuiButton key="create" fill iconType="plusInCircle">
            Create policy
          </EuiButton>,
        ]}
        breadcrumbs={[{ text: 'V2 Alerting Preview' }, { text: 'Notification Policies' }]}
      />
      <EuiSpacer size="m" />
      <EuiText size="xs">
        Showing <strong>{fakePolicies.length}</strong> notification policies
      </EuiText>
      <EuiSpacer size="s" />
      <EuiBasicTable
        items={fakePolicies}
        columns={columns}
        itemId="id"
        tableCaption="Notification Policies"
        responsiveBreakpoint={false}
      />
    </>
  );
};
