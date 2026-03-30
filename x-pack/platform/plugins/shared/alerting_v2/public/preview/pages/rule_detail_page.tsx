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
  EuiCodeBlock,
  EuiDescriptionList,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiLink,
  EuiPageHeader,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { useHistory, useParams } from 'react-router-dom';

import { previewPaths } from '../preview_paths';

const FAKE_ESQL = `FROM metrics-*
| WHERE @timestamp > NOW() - 5 minutes
| STATS avg_cpu = AVG(system.cpu.total.pct) BY host.name
| WHERE avg_cpu > 0.85`;

export const RuleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  return (
    <>
      <EuiPageHeader
        pageTitle={
          <EuiFlexGroup alignItems="center" gutterSize="m" responsive={false}>
            <EuiFlexItem grow={false}>High CPU on prod hosts</EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiBadge color="success">Enabled</EuiBadge>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiBadge color="accent">Preview</EuiBadge>
            </EuiFlexItem>
          </EuiFlexGroup>
        }
        breadcrumbs={[
          { text: 'V2 Alerting Preview' },
          { text: 'Rules', onClick: () => history.push('/') },
          { text: 'High CPU on prod hosts' },
        ]}
        rightSideItems={[
          <EuiButton key="edit" iconType="pencil">
            Edit rule
          </EuiButton>,
          <EuiButtonEmpty key="disable" iconType="bellSlash">
            Disable
          </EuiButtonEmpty>,
        ]}
      />

      <EuiSpacer size="l" />

      <EuiFlexGroup>
        <EuiFlexItem grow={2}>
          <EuiTitle size="xs">
            <h3>ES|QL Query</h3>
          </EuiTitle>
          <EuiSpacer size="s" />
          <EuiCodeBlock language="esql" paddingSize="m" isCopyable>
            {FAKE_ESQL}
          </EuiCodeBlock>

          <EuiSpacer size="l" />

          <EuiTitle size="xs">
            <h3>Active Episodes</h3>
          </EuiTitle>
          <EuiSpacer size="s" />
          <EuiText size="s">
            This rule currently has <EuiBadge color="danger">3 active episodes</EuiBadge>.{' '}
            <EuiLink href={previewPaths.alerts}>View in Alerts & Episodes →</EuiLink>
          </EuiText>

          <EuiSpacer size="l" />

          <EuiTitle size="xs">
            <h3>Notification Policies</h3>
          </EuiTitle>
          <EuiSpacer size="s" />
          <EuiFlexGroup gutterSize="s" direction="column">
            <EuiFlexItem>
              <EuiPanel hasShadow={false} hasBorder paddingSize="s">
                <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
                  <EuiFlexItem grow={false}>
                    <EuiLink href={previewPaths.notificationPolicyDetail('np-1')}>
                      Critical PagerDuty
                    </EuiLink>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiCode transparentBackground>severity: critical</EuiCode>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiBadge color="hollow">PagerDuty Escalation</EuiBadge>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiPanel>
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiPanel hasShadow={false} hasBorder paddingSize="s">
                <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
                  <EuiFlexItem grow={false}>
                    <EuiLink href={previewPaths.notificationPolicyDetail('np-2')}>
                      Slack #ops-alerts
                    </EuiLink>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiBadge color="hollow">catch-all</EuiBadge>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiBadge color="hollow">Slack Notification</EuiBadge>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiPanel>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>

        <EuiFlexItem grow={1}>
          <EuiPanel hasShadow={false} hasBorder>
            <EuiTitle size="xs">
              <h3>Configuration</h3>
            </EuiTitle>
            <EuiHorizontalRule margin="s" />
            <EuiDescriptionList
              compressed
              type="column"
              listItems={[
                { title: 'ID', description: id },
                { title: 'Kind', description: 'alert' },
                { title: 'Schedule', description: 'Every 1 minute' },
                { title: 'Lookback', description: '5 minutes' },
                { title: 'Group by', description: 'host.name' },
                { title: 'Source', description: 'metrics-*' },
                { title: 'Pending threshold', description: '0 (immediate)' },
                { title: 'Recovery threshold', description: '3 consecutive' },
                { title: 'No-data behavior', description: 'Last status' },
                { title: 'Owner', description: 'SRE team' },
                { title: 'Labels', description: 'infra, critical' },
              ]}
            />
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
};
