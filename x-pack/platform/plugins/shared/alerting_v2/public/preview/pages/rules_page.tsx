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
  EuiButtonEmpty,
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

interface FakeRule {
  id: string;
  name: string;
  kind: 'alert' | 'signal';
  source: string;
  schedule: string;
  enabled: boolean;
  labels: string[];
  lastRun: string;
  activeEpisodes: number;
}

const fakeRules: FakeRule[] = [
  { id: '1', name: 'High CPU on prod hosts', kind: 'alert', source: 'metrics-*', schedule: '1m', enabled: true, labels: ['infra', 'critical'], lastRun: '12s ago', activeEpisodes: 3 },
  { id: '2', name: 'Error rate > 5%', kind: 'alert', source: 'logs-*', schedule: '1m', enabled: true, labels: ['apm'], lastRun: '45s ago', activeEpisodes: 1 },
  { id: '3', name: 'Disk usage > 90%', kind: 'alert', source: 'metrics-*', schedule: '5m', enabled: true, labels: ['infra'], lastRun: '2m ago', activeEpisodes: 2 },
  { id: '4', name: 'K8s pod restarts', kind: 'alert', source: 'metrics-k8s-*', schedule: '1m', enabled: true, labels: ['k8s'], lastRun: '30s ago', activeEpisodes: 0 },
  { id: '5', name: 'Latency p99 > 500ms', kind: 'alert', source: 'traces-*', schedule: '1m', enabled: true, labels: ['apm', 'slo'], lastRun: '15s ago', activeEpisodes: 1 },
  { id: '6', name: 'Security: failed logins', kind: 'signal', source: 'logs-auth-*', schedule: '1m', enabled: true, labels: ['security'], lastRun: '20s ago', activeEpisodes: 0 },
  { id: '7', name: 'No data: payment service', kind: 'alert', source: 'logs-*', schedule: '5m', enabled: true, labels: ['business'], lastRun: '3m ago', activeEpisodes: 1 },
  { id: '8', name: 'Memory pressure > 80%', kind: 'alert', source: 'metrics-*', schedule: '2m', enabled: false, labels: ['infra'], lastRun: '1h ago', activeEpisodes: 0 },
  { id: '9', name: 'Log volume anomaly', kind: 'signal', source: 'logs-*', schedule: '5m', enabled: true, labels: ['ml'], lastRun: '4m ago', activeEpisodes: 0 },
  { id: '10', name: 'SLO burn rate breach', kind: 'alert', source: '.rule-events-*', schedule: '1m', enabled: true, labels: ['slo', 'rules-on-rules'], lastRun: '10s ago', activeEpisodes: 0 },
  { id: '11', name: 'Multi-signal correlation', kind: 'alert', source: '.rule-events-*', schedule: '2m', enabled: true, labels: ['rules-on-rules'], lastRun: '1m ago', activeEpisodes: 0 },
  { id: '12', name: 'External: Datadog import', kind: 'alert', source: 'external-datadog', schedule: '1m', enabled: true, labels: ['external'], lastRun: '25s ago', activeEpisodes: 0 },
  { id: '13', name: 'HTTP 5xx spike', kind: 'alert', source: 'logs-*', schedule: '1m', enabled: true, labels: ['apm'], lastRun: '8s ago', activeEpisodes: 0 },
  { id: '14', name: 'Queue depth > threshold', kind: 'alert', source: 'metrics-*', schedule: '2m', enabled: false, labels: ['infra'], lastRun: '30m ago', activeEpisodes: 0 },
];

export const RulesPage = () => {
  const history = useHistory();

  const columns: Array<EuiBasicTableColumn<FakeRule>> = [
    {
      field: 'name',
      name: 'Name',
      render: (name: string, rule: FakeRule) => (
        <EuiLink onClick={() => history.push(`/${rule.id}`)}>{name}</EuiLink>
      ),
    },
    {
      field: 'kind',
      name: 'Mode',
      width: '110px',
      render: (kind: string) => (
        <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false}>
          <EuiFlexItem grow={false}>
            <EuiIcon type={kind === 'alert' ? 'bell' : 'securitySignalResolved'} size="s" />
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiText size="xs">{kind === 'alert' ? 'Alerting' : 'Detect only'}</EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      ),
    },
    {
      field: 'source',
      name: 'Source',
      width: '140px',
      render: (source: string) => <EuiBadge color="hollow">{source}</EuiBadge>,
    },
    {
      field: 'labels',
      name: 'Labels',
      width: '160px',
      render: (labels: string[]) => (
        <EuiFlexGroup gutterSize="xs" wrap responsive={false}>
          {labels.map((l) => (
            <EuiFlexItem key={l} grow={false}>
              <EuiBadge color="hollow">{l}</EuiBadge>
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
      ),
    },
    {
      field: 'schedule',
      name: 'Interval',
      width: '80px',
    },
    {
      field: 'enabled',
      name: 'Status',
      width: '90px',
      render: (enabled: boolean) =>
        enabled ? (
          <EuiHealth color="success">Enabled</EuiHealth>
        ) : (
          <EuiHealth color="subdued">Disabled</EuiHealth>
        ),
    },
    {
      field: 'activeEpisodes',
      name: 'Episodes',
      width: '90px',
      render: (count: number) =>
        count > 0 ? (
          <EuiBadge color="danger">{count} active</EuiBadge>
        ) : (
          <EuiText size="xs" color="subdued">
            —
          </EuiText>
        ),
    },
    {
      field: 'lastRun',
      name: 'Last run',
      width: '90px',
      render: (val: string) => (
        <EuiText size="xs" color="subdued">
          {val}
        </EuiText>
      ),
    },
  ];

  return (
    <>
      <EuiPageHeader
        pageTitle={
          <EuiFlexGroup alignItems="center" gutterSize="m" responsive={false}>
            <EuiFlexItem grow={false}>Rules</EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiBadge color="accent">Preview</EuiBadge>
            </EuiFlexItem>
          </EuiFlexGroup>
        }
        description="ES|QL-powered detection rules that produce append-only rule events."
        rightSideItems={[
          <EuiButton key="create" fill iconType="plusInCircle">
            Create rule
          </EuiButton>,
        ]}
        breadcrumbs={[{ text: 'V2 Alerting Preview' }, { text: 'Rules' }]}
      />
      <EuiSpacer size="m" />
      <EuiFlexGroup alignItems="center" gutterSize="m">
        <EuiFlexItem grow={false}>
          <EuiText size="xs">
            Showing <strong>1–{fakeRules.length}</strong> of{' '}
            <strong>{fakeRules.length} rules</strong>
          </EuiText>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiToolTip content="Rules that query .rule-events-* are 'rules on rules' — they detect patterns across other rule outputs">
            <EuiBadge
              color="hollow"
              iconType="questionInCircle"
              iconSide="right"
            >
              2 rules-on-rules
            </EuiBadge>
          </EuiToolTip>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="s" />
      <EuiBasicTable
        items={fakeRules}
        columns={columns}
        itemId="id"
        tableCaption="Rules"
        responsiveBreakpoint={false}
      />
    </>
  );
};
