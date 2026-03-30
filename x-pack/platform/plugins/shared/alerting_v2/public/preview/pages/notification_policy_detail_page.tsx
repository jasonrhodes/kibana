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
  EuiIcon,
  EuiLink,
  EuiPageHeader,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { useHistory, useParams } from 'react-router-dom';

import { previewPaths } from '../preview_paths';

export const NotificationPolicyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  return (
    <>
      <EuiPageHeader
        pageTitle={
          <EuiFlexGroup alignItems="center" gutterSize="m" responsive={false}>
            <EuiFlexItem grow={false}>Critical PagerDuty</EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiHealth color="success">Enabled</EuiHealth>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiBadge color="accent">Preview</EuiBadge>
            </EuiFlexItem>
          </EuiFlexGroup>
        }
        breadcrumbs={[
          { text: 'V2 Alerting Preview' },
          { text: 'Notification Policies', onClick: () => history.push('/') },
          { text: 'Critical PagerDuty' },
        ]}
        rightSideItems={[
          <EuiButton key="edit" iconType="pencil">
            Edit policy
          </EuiButton>,
          <EuiButtonEmpty key="snooze" iconType="bellSlash">
            Snooze
          </EuiButtonEmpty>,
        ]}
      />

      <EuiSpacer size="l" />

      <EuiFlexGroup>
        <EuiFlexItem grow={2}>
          <EuiPanel hasShadow={false} hasBorder>
            <EuiTitle size="xs">
              <h3>Policy Configuration</h3>
            </EuiTitle>
            <EuiHorizontalRule margin="s" />
            <EuiDescriptionList
              type="column"
              listItems={[
                { title: 'ID', description: id },
                {
                  title: 'Matcher (KQL)',
                  description: (
                    <EuiCode transparentBackground>severity: critical</EuiCode>
                  ),
                },
                {
                  title: 'Group by',
                  description: (
                    <EuiCode transparentBackground>service</EuiCode>
                  ),
                },
                { title: 'Throttle', description: '5 minutes' },
                {
                  title: 'Workflow',
                  description: (
                    <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false}>
                      <EuiFlexItem grow={false}>
                        <EuiIcon type="pipelineApp" size="s" />
                      </EuiFlexItem>
                      <EuiFlexItem grow={false}>PagerDuty Escalation</EuiFlexItem>
                    </EuiFlexGroup>
                  ),
                },
              ]}
            />
          </EuiPanel>

          <EuiSpacer size="l" />

          <EuiTitle size="xs">
            <h3>Linked Rules</h3>
          </EuiTitle>
          <EuiSpacer size="s" />
          <EuiText size="s">
            This policy is attached to <strong>5 rules</strong>. When any of
            these rules produce alert episodes matching{' '}
            <EuiCode transparentBackground>severity: critical</EuiCode>, the
            dispatcher will group by <code>service</code> and route to PagerDuty.
          </EuiText>
          <EuiSpacer size="s" />
          {['High CPU on prod hosts', 'Error rate > 5%', 'Disk usage > 90%', 'No data: payment service', 'HTTP 5xx spike'].map(
            (name, i) => (
              <React.Fragment key={name}>
                <EuiPanel hasShadow={false} hasBorder paddingSize="s">
                  <EuiLink href={previewPaths.ruleDetail(String(i + 1))}>
                    {name}
                  </EuiLink>
                </EuiPanel>
                {i < 4 && <EuiSpacer size="xs" />}
              </React.Fragment>
            )
          )}
        </EuiFlexItem>

        <EuiFlexItem grow={1}>
          <EuiPanel hasShadow={false} hasBorder>
            <EuiTitle size="xs">
              <h3>Recent Dispatches</h3>
            </EuiTitle>
            <EuiHorizontalRule margin="s" />
            {[
              { time: '2m ago', group: 'service: checkout', status: 'fired' },
              { time: '7m ago', group: 'service: search-api', status: 'fired' },
              { time: '12m ago', group: 'service: checkout', status: 'throttled' },
              { time: '20m ago', group: 'service: payments', status: 'fired' },
            ].map((d, i) => (
              <React.Fragment key={i}>
                <EuiFlexGroup gutterSize="s" alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiBadge color="hollow">{d.time}</EuiBadge>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiCode transparentBackground>{d.group}</EuiCode>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    {d.status === 'fired' ? (
                      <EuiBadge color="success">fired</EuiBadge>
                    ) : (
                      <EuiBadge color="warning">throttled</EuiBadge>
                    )}
                  </EuiFlexItem>
                </EuiFlexGroup>
                {i < 3 && <EuiSpacer size="xs" />}
              </React.Fragment>
            ))}
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
