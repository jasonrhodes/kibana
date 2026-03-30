/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import {
  EuiBadge,
  EuiCallOut,
  EuiCard,
  EuiCode,
  EuiCodeBlock,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiIcon,
  EuiLink,
  EuiPageHeader,
  EuiPanel,
  EuiSpacer,
  EuiStat,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { previewPaths } from '../preview_paths';

const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) => (
  <>
    <EuiFlexGroup alignItems="center" gutterSize="s" responsive={false}>
      <EuiFlexItem grow={false}>
        <EuiIcon type={icon} size="l" color="primary" />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiTitle size="s">
          <h2>{title}</h2>
        </EuiTitle>
      </EuiFlexItem>
    </EuiFlexGroup>
    <EuiSpacer size="m" />
    {children}
    <EuiSpacer size="xl" />
  </>
);

const ComparisonRow = ({
  aspect,
  v1,
  v2,
}: {
  aspect: string;
  v1: string;
  v2: string;
}) => (
  <EuiFlexGroup gutterSize="m" responsive={false}>
    <EuiFlexItem grow={2}>
      <EuiText size="s">
        <strong>{aspect}</strong>
      </EuiText>
    </EuiFlexItem>
    <EuiFlexItem grow={3}>
      <EuiText size="s" color="subdued">
        {v1}
      </EuiText>
    </EuiFlexItem>
    <EuiFlexItem grow={3}>
      <EuiText size="s">{v2}</EuiText>
    </EuiFlexItem>
  </EuiFlexGroup>
);

export const WhyV2Page = () => {
  return (
    <>
      <EuiPageHeader
        pageTitle={
          <EuiFlexGroup alignItems="center" gutterSize="m" responsive={false}>
            <EuiFlexItem grow={false}>Why Alerting v2?</EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiBadge color="accent">Preview</EuiBadge>
            </EuiFlexItem>
          </EuiFlexGroup>
        }
        description="A ground-up rethink of how alerting works in Kibana — built on ES|QL, append-only event data, and a unified notification pipeline."
        breadcrumbs={[{ text: 'V2 Alerting Preview' }, { text: 'Why v2?' }]}
      />
      <EuiSpacer size="l" />

      {/* Headline stats */}
      <EuiFlexGroup gutterSize="l">
        <EuiFlexItem>
          <EuiPanel paddingSize="l" hasShadow={false} hasBorder>
            <EuiStat title="ES|QL" description="Query language" titleColor="primary" />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel paddingSize="l" hasShadow={false} hasBorder>
            <EuiStat title="Append-only" description="Event model" titleColor="primary" />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel paddingSize="l" hasShadow={false} hasBorder>
            <EuiStat title="Signals + Alerts" description="Dual rule modes" titleColor="primary" />
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel paddingSize="l" hasShadow={false} hasBorder>
            <EuiStat
              title="Rules on rules"
              description="Correlation & escalation"
              titleColor="primary"
            />
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="xl" />

      {/* The problem with v1 */}
      <Section title="The problem with v1" icon="alert">
        <EuiText>
          <p>
            Kibana Alerting v1 has served well, but its architecture creates friction that
            compounds over time:
          </p>
          <ul>
            <li>
              <strong>Rule types are black boxes.</strong> Each solution team registers an executor
              function with arbitrary code. What gets stored in an alert document varies wildly
              between rule types — and users can't change it.
            </li>
            <li>
              <strong>Alerts are updated in place.</strong> Only the latest value is kept. There's no
              history of how an alert evolved, making investigation painful.
            </li>
            <li>
              <strong>Alert data is hard to query.</strong> Bespoke indices, complex RBAC, and
              inconsistent schemas mean you can't just "look at your alerts" in Discover.
            </li>
            <li>
              <strong>Notification control is scattered.</strong> Flapping suppression, per-action
              frequency, run-when conditions, KQL filters, timeframe constraints, mute, snooze,
              disable — all configured in different places with overlapping semantics.
            </li>
            <li>
              <strong>Rules can't build on other rules.</strong> There's no way to detect patterns
              across rule outputs, making escalation and correlation impossible within the framework.
            </li>
          </ul>
        </EuiText>
      </Section>

      {/* What changes in v2 */}
      <Section title="What changes in v2" icon="sparkles">
        <EuiPanel hasShadow={false} hasBorder paddingSize="l">
          <EuiFlexGroup gutterSize="none" responsive={false}>
            <EuiFlexItem grow={2}>
              <EuiText size="s">
                <strong>Aspect</strong>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={3}>
              <EuiText size="s" color="subdued">
                <strong>v1</strong>
              </EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={3}>
              <EuiText size="s">
                <strong>v2</strong>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiHorizontalRule margin="s" />
          <ComparisonRow
            aspect="What gets stored"
            v1="Rule type decides; unpredictable across types"
            v2="Author chooses via ES|QL KEEP — stored in the data field"
          />
          <EuiSpacer size="s" />
          <ComparisonRow
            aspect="Alert persistence"
            v1="Updated in-place; only latest value"
            v2="Append-only; new event per evaluation"
          />
          <EuiSpacer size="s" />
          <ComparisonRow
            aspect="Queryability"
            v1="Bespoke indices, complex RBAC"
            v2="ES|QL in Discover, like any other data"
          />
          <EuiSpacer size="s" />
          <ComparisonRow
            aspect="Rule definition"
            v1="Plugin-registered executor with arbitrary code"
            v2="ES|QL queries; rule types are parameterized abstractions"
          />
          <EuiSpacer size="s" />
          <ComparisonRow
            aspect="Notification control"
            v1="Per-action frequency, flapping, mute/snooze/disable on rules"
            v2="Notification policies with KQL matchers, per-series snooze, ack/unack on episodes"
          />
          <EuiSpacer size="s" />
          <ComparisonRow
            aspect="Rules on rules"
            v1="Not possible"
            v2="Natural consequence — rule events are queryable data"
          />
        </EuiPanel>
      </Section>

      {/* Core concepts */}
      <Section title="Core concepts" icon="list">
        <EuiFlexGroup gutterSize="l" wrap>
          <EuiFlexItem style={{ minWidth: 260 }}>
            <EuiCard
              title="Rules"
              titleSize="xs"
              description="Declarative ES|QL logic evaluated on a schedule. Each evaluation writes immutable rule events. Rules operate in two modes: alerting (lifecycle tracking) or signal (observation only)."
              icon={<EuiIcon type="editorCodeBlock" size="xl" color="primary" />}
              footer={
                <EuiLink href={previewPaths.rules}>
                  Explore rules <EuiIcon type="arrowRight" size="s" />
                </EuiLink>
              }
            />
          </EuiFlexItem>
          <EuiFlexItem style={{ minWidth: 260 }}>
            <EuiCard
              title="Episodes"
              titleSize="xs"
              description="A lifecycle arc for an alerting rule's grouped series — from first breach through active, recovering, and back to inactive. Episodes are the primary unit of triage."
              icon={<EuiIcon type="timeline" size="xl" color="primary" />}
              footer={
                <EuiLink href={previewPaths.alerts}>
                  Explore alerts & episodes <EuiIcon type="arrowRight" size="s" />
                </EuiLink>
              }
            />
          </EuiFlexItem>
          <EuiFlexItem style={{ minWidth: 260 }}>
            <EuiCard
              title="Notification Policies"
              titleSize="xs"
              description="The gating layer between episodes and workflows. Match by KQL, group related episodes, throttle by interval, and route to the right workflow."
              icon={<EuiIcon type="bell" size="xl" color="primary" />}
              footer={
                <EuiLink href={previewPaths.notificationPolicies}>
                  Explore policies <EuiIcon type="arrowRight" size="s" />
                </EuiLink>
              }
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </Section>

      {/* ES|QL first */}
      <Section title="ES|QL first" icon="editorCodeBlock">
        <EuiText>
          <p>
            Every v2 rule is an ES|QL query. The query defines the data source, the computation,
            and what gets persisted. There's no arbitrary executor code — the framework runs
            the query, writes the results, and handles lifecycle transitions.
          </p>
        </EuiText>
        <EuiSpacer size="m" />
        <EuiCodeBlock language="sql" fontSize="m" paddingSize="m" isCopyable>
          {`FROM metrics-*
| WHERE @timestamp > NOW() - 5 minutes
| STATS avg_cpu = AVG(system.cpu.total.pct) BY host.name
| WHERE avg_cpu > 0.9
| KEEP host.name, avg_cpu`}
        </EuiCodeBlock>
        <EuiSpacer size="s" />
        <EuiText size="s" color="subdued">
          <p>
            The <EuiCode>KEEP</EuiCode> fields become the rule event's{' '}
            <EuiCode>data</EuiCode> payload. Because rule events are written to standard
            Elasticsearch indices, you can query them in Discover just like any other data —
            and other rules can query them too.
          </p>
        </EuiText>
      </Section>

      {/* Rules on rules */}
      <Section title="Rules on rules" icon="layers">
        <EuiText>
          <p>
            Because rule events are data in <EuiCode>.rule-events-*</EuiCode>, rules can query
            other rules' output. This enables escalation, correlation, and noise reduction
            patterns that are structurally impossible in v1.
          </p>
        </EuiText>
        <EuiSpacer size="m" />
        <EuiCodeBlock language="sql" fontSize="m" paddingSize="m" isCopyable>
          {`FROM .rule-events-*
| WHERE @timestamp > NOW() - 10 minutes AND status == "breached"
| STATS
    rule_count = COUNT_DISTINCT(rule.id),
    event_count = COUNT(*)
  BY data.service
| WHERE rule_count >= 2 AND event_count >= 3`}
        </EuiCodeBlock>
        <EuiSpacer size="s" />
        <EuiText size="s" color="subdued">
          <p>
            This higher-order rule fires only when multiple underlying rules are breaching for
            the same service — turning low-level signals into meaningful, correlated alerts.
          </p>
        </EuiText>
      </Section>

      {/* Lifecycle */}
      <Section title="Episode lifecycle" icon="timeline">
        <EuiText>
          <p>
            Alerting rules (<EuiCode>kind: alert</EuiCode>) track episodes through a four-state
            lifecycle. Configurable thresholds control when episodes promote from pending to active
            and when they demote from recovering to inactive — reducing noise from transient
            conditions.
          </p>
        </EuiText>
        <EuiSpacer size="m" />
        <EuiPanel hasShadow={false} hasBorder paddingSize="l" color="subdued">
          <EuiText size="s" style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>
            {`  ┌──────────┐     ┌─────────┐     ┌────────┐     ┌────────────┐
  │ Inactive ├────►│ Pending ├────►│ Active ├────►│ Recovering │
  └──────────┘     └─────────┘     └────────┘     └─────┬──────┘
       ▲                                                 │
       └─────────────────────────────────────────────────┘`}
          </EuiText>
        </EuiPanel>
        <EuiSpacer size="m" />
        <EuiText size="s">
          <ul>
            <li>
              <strong>Inactive → Pending:</strong> Condition first detected. The episode begins.
            </li>
            <li>
              <strong>Pending → Active:</strong> Condition persists past the activation threshold
              (configurable count and/or timeframe).
            </li>
            <li>
              <strong>Active → Recovering:</strong> Condition no longer detected, but recovery
              threshold not yet met.
            </li>
            <li>
              <strong>Recovering → Inactive:</strong> Recovery threshold satisfied. The episode ends.
            </li>
          </ul>
        </EuiText>
      </Section>

      {/* Unified notification pipeline */}
      <Section title="Unified notification pipeline" icon="bell">
        <EuiText>
          <p>
            v1 scatters notification control across per-action frequency, flapping suppression,
            run-when conditions, KQL filters, mute, snooze, and disable. v2 replaces all of this
            with <strong>notification policies</strong> — a single, composable layer between
            episodes and workflows.
          </p>
        </EuiText>
        <EuiSpacer size="m" />
        <EuiPanel hasShadow={false} hasBorder paddingSize="l" color="subdued">
          <EuiText size="s" style={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>
            {`  Episodes
      │
      ▼
  ┌──────────────────────┐
  │  Notification Policy  │
  │                       │
  │  Match:  KQL matcher  │
  │  Group:  data.* fields│
  │  Throttle: interval   │
  └───────────┬───────────┘
              │
              ▼
         Workflow
    (actions, enrichment,
     external integrations)`}
          </EuiText>
        </EuiPanel>
        <EuiSpacer size="m" />
        <EuiText size="s" color="subdued">
          <p>
            Suppression actions (acknowledge, snooze, silence, maintenance windows) all gate at the
            notification policy layer — not on the rule. Rules keep detecting; only notifications
            are suppressed.
          </p>
        </EuiText>
      </Section>

      {/* Migration */}
      <Section title="Migration path" icon="merge">
        <EuiCallOut
          title="v1 is not going away"
          iconType="iInCircle"
          color="primary"
        >
          <p>
            v2 runs alongside v1. There is no forced migration. Users copy rules from v1 to v2 at
            their own pace, verify the output, and optionally disable the v1 rule. v2 can display
            v1 alerts as read-only (via the <EuiCode>source</EuiCode> field), but v1 will never
            show v2 rule events.
          </p>
        </EuiCallOut>
      </Section>

      {/* Explore links */}
      <EuiHorizontalRule />
      <EuiTitle size="xs">
        <h3>Explore the preview</h3>
      </EuiTitle>
      <EuiSpacer size="m" />
      <EuiFlexGroup gutterSize="m">
        <EuiFlexItem grow={false}>
          <EuiLink href={previewPaths.rules}>
            <EuiIcon type="editorCodeBlock" /> Rules
          </EuiLink>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiLink href={previewPaths.alerts}>
            <EuiIcon type="timeline" /> Alerts & Episodes
          </EuiLink>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiLink href={previewPaths.notificationPolicies}>
            <EuiIcon type="bell" /> Notification Policies
          </EuiLink>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiSpacer size="xl" />
    </>
  );
};
