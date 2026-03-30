/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import {
  EuiBadge,
  EuiButton,
  EuiButtonEmpty,
  EuiCode,
  EuiDescriptionList,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHealth,
  EuiHorizontalRule,
  EuiLink,
  EuiPageHeader,
  EuiPanel,
  EuiSpacer,
  EuiSteps,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { useHistory, useParams } from 'react-router-dom';

import { previewPaths } from '../preview_paths';

export const AlertDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const timelineSteps = [
    {
      title: 'Breached (Active)',
      status: 'danger' as const,
      children: (
        <EuiText size="xs" color="subdued">
          Now — CPU at 92% on prod-web-01
        </EuiText>
      ),
    },
    {
      title: 'Breached (Active)',
      status: 'danger' as const,
      children: (
        <EuiText size="xs" color="subdued">
          1m ago — CPU at 89%
        </EuiText>
      ),
    },
    {
      title: 'Breached (Pending → Active)',
      status: 'warning' as const,
      children: (
        <EuiText size="xs" color="subdued">
          2m ago — Threshold exceeded, transitioned to Active
        </EuiText>
      ),
    },
    {
      title: 'Breached (Pending)',
      status: 'warning' as const,
      children: (
        <EuiText size="xs" color="subdued">
          3m ago — First breach detected, CPU at 86%
        </EuiText>
      ),
    },
    {
      title: 'Episode started',
      status: 'incomplete' as const,
      children: (
        <EuiText size="xs" color="subdued">
          2h 15m ago — New episode created
        </EuiText>
      ),
    },
  ];

  return (
    <>
      <EuiPageHeader
        pageTitle={
          <EuiFlexGroup alignItems="center" gutterSize="m" responsive={false}>
            <EuiFlexItem grow={false}>
              <EuiHealth color="danger" style={{ fontSize: 'inherit' }}>
                Episode: prod-web-01
              </EuiHealth>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiBadge color="accent">Preview</EuiBadge>
            </EuiFlexItem>
          </EuiFlexGroup>
        }
        breadcrumbs={[
          { text: 'V2 Alerting Preview' },
          { text: 'Alerts & Episodes', onClick: () => history.push('/') },
          { text: `Episode ${id}` },
        ]}
        rightSideItems={[
          <EuiButton key="ack" iconType="check" color="primary">
            Acknowledge
          </EuiButton>,
          <EuiButtonEmpty key="snooze" iconType="bellSlash">
            Snooze
          </EuiButtonEmpty>,
        ]}
      />

      <EuiSpacer size="l" />

      <EuiFlexGroup>
        <EuiFlexItem grow={2}>
          <EuiTitle size="xs">
            <h3>Episode Timeline</h3>
          </EuiTitle>
          <EuiSpacer size="m" />
          <EuiSteps steps={timelineSteps} />

          <EuiSpacer size="l" />

          <EuiTitle size="xs">
            <h3>Notification History</h3>
          </EuiTitle>
          <EuiSpacer size="s" />
          <EuiPanel hasShadow={false} hasBorder paddingSize="s">
            <EuiFlexGroup alignItems="center" gutterSize="m">
              <EuiFlexItem grow={false}>
                <EuiBadge color="hollow">2m ago</EuiBadge>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiText size="xs">
                  Dispatched via <strong>Critical PagerDuty</strong> →{' '}
                  <EuiCode transparentBackground>PagerDuty Escalation</EuiCode>
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
          <EuiSpacer size="xs" />
          <EuiPanel hasShadow={false} hasBorder paddingSize="s">
            <EuiFlexGroup alignItems="center" gutterSize="m">
              <EuiFlexItem grow={false}>
                <EuiBadge color="hollow">5m ago</EuiBadge>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiText size="xs">
                  Dispatched via <strong>Slack #ops-alerts</strong> →{' '}
                  <EuiCode transparentBackground>Slack Notification</EuiCode>
                </EuiText>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
        </EuiFlexItem>

        <EuiFlexItem grow={1}>
          <EuiPanel hasShadow={false} hasBorder>
            <EuiTitle size="xs">
              <h3>Episode Details</h3>
            </EuiTitle>
            <EuiHorizontalRule margin="s" />
            <EuiDescriptionList
              compressed
              type="column"
              listItems={[
                { title: 'Episode ID', description: id },
                {
                  title: 'Status',
                  description: <EuiHealth color="danger">Active</EuiHealth>,
                },
                {
                  title: 'Severity',
                  description: <EuiBadge color="danger">critical</EuiBadge>,
                },
                { title: 'Duration', description: '2h 15m' },
                { title: 'Status count', description: '135 (consecutive breaches)' },
                {
                  title: 'Group',
                  description: (
                    <EuiCode transparentBackground>host.name: prod-web-01</EuiCode>
                  ),
                },
                {
                  title: 'Rule',
                  description: (
                    <EuiLink href={previewPaths.ruleDetail('1')}>
                      High CPU on prod hosts
                    </EuiLink>
                  ),
                },
                { title: 'Acknowledged', description: 'No' },
                { title: 'Snoozed', description: 'No' },
              ]}
            />
          </EuiPanel>

          <EuiSpacer size="m" />

          <EuiPanel hasShadow={false} hasBorder>
            <EuiTitle size="xs">
              <h3>Latest Event Data</h3>
            </EuiTitle>
            <EuiHorizontalRule margin="s" />
            <EuiDescriptionList
              compressed
              type="column"
              listItems={[
                { title: 'host.name', description: 'prod-web-01' },
                { title: 'avg_cpu', description: '0.92' },
                { title: '@timestamp', description: '2026-03-26T18:45:12Z' },
              ]}
            />
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
