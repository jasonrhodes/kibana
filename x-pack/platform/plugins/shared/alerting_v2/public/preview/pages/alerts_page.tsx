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
  EuiButtonGroup,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHealth,
  EuiLink,
  EuiPageHeader,
  EuiPanel,
  EuiSpacer,
  EuiStat,
  EuiText,
  type EuiBasicTableColumn,
} from '@elastic/eui';
import { useHistory } from 'react-router-dom';

import { previewPaths } from '../preview_paths';

interface FakeEpisode {
  id: string;
  rule: string;
  ruleId: string;
  group: string;
  status: 'active' | 'pending' | 'recovering' | 'inactive';
  severity: string;
  started: string;
  duration: string;
  lastEvent: string;
  acked: boolean;
}

const fakeEpisodes: FakeEpisode[] = [
  { id: 'ep-1', rule: 'High CPU on prod hosts', ruleId: '1', group: 'host: prod-web-01', status: 'active', severity: 'critical', started: '2h ago', duration: '2h 15m', lastEvent: '12s ago', acked: false },
  { id: 'ep-2', rule: 'High CPU on prod hosts', ruleId: '1', group: 'host: prod-web-03', status: 'active', severity: 'critical', started: '45m ago', duration: '45m', lastEvent: '12s ago', acked: true },
  { id: 'ep-3', rule: 'High CPU on prod hosts', ruleId: '1', group: 'host: prod-api-02', status: 'recovering', severity: 'warning', started: '3h ago', duration: '3h 10m', lastEvent: '1m ago', acked: false },
  { id: 'ep-4', rule: 'Error rate > 5%', ruleId: '2', group: 'service: checkout', status: 'active', severity: 'high', started: '20m ago', duration: '20m', lastEvent: '45s ago', acked: false },
  { id: 'ep-5', rule: 'Disk usage > 90%', ruleId: '3', group: 'host: db-primary', status: 'active', severity: 'critical', started: '6h ago', duration: '6h 5m', lastEvent: '2m ago', acked: true },
  { id: 'ep-6', rule: 'Disk usage > 90%', ruleId: '3', group: 'host: db-replica-02', status: 'pending', severity: 'warning', started: '5m ago', duration: '5m', lastEvent: '2m ago', acked: false },
  { id: 'ep-7', rule: 'Latency p99 > 500ms', ruleId: '5', group: 'service: search-api', status: 'active', severity: 'high', started: '1h ago', duration: '1h 2m', lastEvent: '15s ago', acked: false },
  { id: 'ep-8', rule: 'No data: payment service', ruleId: '7', group: 'service: payments', status: 'active', severity: 'critical', started: '10m ago', duration: '10m', lastEvent: '3m ago', acked: false },
];

const statusColorMap: Record<string, string> = {
  active: 'danger',
  pending: 'warning',
  recovering: 'primary',
  inactive: 'subdued',
};

const severityColorMap: Record<string, string> = {
  critical: 'danger',
  high: '#BD271E',
  warning: 'warning',
  low: 'subdued',
};

export const AlertsPage = () => {
  const history = useHistory();
  const [view, setView] = React.useState('episodes');

  const columns: Array<EuiBasicTableColumn<FakeEpisode>> = [
    {
      field: 'status',
      name: 'Status',
      width: '110px',
      render: (status: string) => (
        <EuiHealth color={statusColorMap[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </EuiHealth>
      ),
    },
    {
      field: 'severity',
      name: 'Severity',
      width: '90px',
      render: (severity: string) => (
        <EuiBadge color={severityColorMap[severity] || 'hollow'}>
          {severity}
        </EuiBadge>
      ),
    },
    {
      field: 'rule',
      name: 'Rule',
      render: (name: string, episode: FakeEpisode) => (
        <EuiLink href={previewPaths.ruleDetail(episode.ruleId)}>{name}</EuiLink>
      ),
    },
    {
      field: 'group',
      name: 'Group',
      render: (group: string) => (
        <EuiText size="xs">
          <code>{group}</code>
        </EuiText>
      ),
    },
    {
      field: 'started',
      name: 'Started',
      width: '90px',
    },
    {
      field: 'duration',
      name: 'Duration',
      width: '90px',
    },
    {
      field: 'acked',
      name: 'Ack',
      width: '60px',
      render: (acked: boolean) =>
        acked ? (
          <EuiBadge color="hollow" iconType="check">
            Yes
          </EuiBadge>
        ) : null,
    },
    {
      field: 'id',
      name: '',
      width: '80px',
      render: (id: string) => (
        <EuiLink onClick={() => history.push(`/${id}`)}>Details</EuiLink>
      ),
    },
  ];

  const activeCount = fakeEpisodes.filter((e) => e.status === 'active').length;
  const pendingCount = fakeEpisodes.filter((e) => e.status === 'pending').length;
  const recoveringCount = fakeEpisodes.filter((e) => e.status === 'recovering').length;

  return (
    <>
      <EuiPageHeader
        pageTitle={
          <EuiFlexGroup alignItems="center" gutterSize="m" responsive={false}>
            <EuiFlexItem grow={false}>Alerts & Episodes</EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiBadge color="accent">Preview</EuiBadge>
            </EuiFlexItem>
          </EuiFlexGroup>
        }
        description="Alert episodes track the full lifecycle of a detected condition — from first breach through recovery."
        breadcrumbs={[{ text: 'V2 Alerting Preview' }, { text: 'Alerts & Episodes' }]}
      />

      <EuiSpacer size="m" />

      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiPanel hasShadow={false} hasBorder>
            <EuiStat title={activeCount} description="Active" titleColor="danger" titleSize="m" />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel hasShadow={false} hasBorder>
            <EuiStat
              title={pendingCount}
              description="Pending"
              titleColor="warning"
              titleSize="m"
            />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel hasShadow={false} hasBorder>
            <EuiStat
              title={recoveringCount}
              description="Recovering"
              titleColor="primary"
              titleSize="m"
            />
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="l" />

      <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
        <EuiFlexItem grow={false}>
          <EuiButtonGroup
            legend="View selector"
            options={[
              { id: 'episodes', label: 'Episodes' },
              { id: 'events', label: 'Rule Events' },
            ]}
            idSelected={view}
            onChange={setView}
            buttonSize="compressed"
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiText size="xs" color="subdued">
            {view === 'events'
              ? 'Rule events are append-only documents — queryable in Discover via ES|QL'
              : `Showing ${fakeEpisodes.length} episodes across ${new Set(fakeEpisodes.map((e) => e.ruleId)).size} rules`}
          </EuiText>
        </EuiFlexItem>
      </EuiFlexGroup>

      <EuiSpacer size="m" />

      {view === 'episodes' ? (
        <EuiBasicTable
          items={fakeEpisodes}
          columns={columns}
          itemId="id"
          tableCaption="Alert Episodes"
          responsiveBreakpoint={false}
        />
      ) : (
        <EuiPanel hasShadow={false} hasBorder color="subdued" paddingSize="xl">
          <EuiFlexGroup direction="column" alignItems="center" gutterSize="m">
            <EuiText textAlign="center">
              <h3>Rule Events Explorer</h3>
              <p>
                Rule events are append-only documents written to{' '}
                <code>.alerting-events</code>. Use Discover with ES|QL to query
                them directly.
              </p>
              <p>
                <EuiLink href="#" external>
                  Open in Discover →
                </EuiLink>
              </p>
            </EuiText>
          </EuiFlexGroup>
        </EuiPanel>
      )}
    </>
  );
};
