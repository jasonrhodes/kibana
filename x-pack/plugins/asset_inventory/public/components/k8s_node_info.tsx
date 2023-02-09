/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingChart,
  EuiPageTemplate,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import React from 'react';
import { Axis, Chart, LineSeries, Position, ScaleType, Settings } from '@elastic/charts';
import { K8sNode } from '../../common/types_api';
import { K8sPodsTable } from './k8s_pods_table';
import { K8sLogsTable } from './k8s_logs_table';
import { CustomDescriptionList } from './custom_description_list';
import { SectionRule } from './section_rule';

function dateFormatter(x: number) {
  const d = new Date(x);
  const timeArray = d.toLocaleString().split(',')[1].slice(1).split(':');
  return timeArray[0] + ':' + timeArray[1];
}

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

  const { metrics = [] } = node;

  const processedMetrics = metrics.map((bucket) => ({
    ...bucket,
    averageMemoryUsage: roundBytesToGB(bucket.averageMemoryUsage),
    averageMemoryAvailable: roundBytesToGB(bucket.averageMemoryAvailable),
    maxMemoryUsage: roundBytesToGB(bucket.maxMemoryUsage),
    averageCpuCoreNs: (bucket.averageCpuCoreNs || 0) / (60 * 10000000000),
    maxCpuCoreNs: (bucket.maxCpuCoreNs || 0) / (60 * 10000000000),
  }));

  return (
    <>
      <EuiPageTemplate.Section>
        <CustomDescriptionList
          items={[
            {
              title: 'Node name',
              description: node.name,
            },
            {
              title: 'Node UID',
              description: node.id,
            },
          ]}
        />
        <SectionRule />
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiText textAlign="left">
              <b>Node memory usage (last 12 hours)</b>
            </EuiText>
            <EuiSpacer size="xs" />
            <Chart size={{ width: '100%', height: 200 }}>
              <Settings />
              <Axis
                id="bottom"
                position={Position.Bottom}
                showOverlappingTicks
                tickFormat={dateFormatter}
                title="Time"
              />
              <Axis
                id="left"
                position={Position.Left}
                showOverlappingTicks
                tickFormat={(x) => x.toFixed(0)}
                title="Memory (GB)"
              />
              <LineSeries
                id="averageMemoryUsage"
                name="Avg Usage"
                xScaleType={ScaleType.Time}
                yScaleType={ScaleType.Linear}
                xAccessor={'timestamp'}
                yAccessors={['averageMemoryUsage']}
                timeZone="local"
                data={processedMetrics}
              />
              <LineSeries
                id="averageMemoryAvailable"
                name="Available"
                xScaleType={ScaleType.Time}
                yScaleType={ScaleType.Linear}
                xAccessor={'timestamp'}
                yAccessors={['averageMemoryAvailable']}
                timeZone="local"
                data={processedMetrics}
              />
              <LineSeries
                id="maxMemoryUsage"
                name="Max Usage"
                xScaleType={ScaleType.Time}
                yScaleType={ScaleType.Linear}
                xAccessor={'timestamp'}
                yAccessors={['maxMemoryUsage']}
                timeZone="local"
                data={processedMetrics}
              />
            </Chart>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiText textAlign="left">
              <b>Node CPU usage (last 12 hours)</b>
            </EuiText>
            <EuiSpacer size="xs" />
            <Chart size={{ width: '100%', height: 200 }}>
              <Settings />
              <Axis
                id="bottom"
                position={Position.Bottom}
                showOverlappingTicks
                tickFormat={dateFormatter}
                title="Time"
              />
              <Axis
                id="left"
                position={Position.Left}
                showOverlappingTicks
                tickFormat={(x) => x.toFixed(2)}
                title="CPU (% per minute)"
              />
              <LineSeries
                id="averageCpuCoreNs"
                name="Avg CPU"
                xScaleType={ScaleType.Time}
                yScaleType={ScaleType.Linear}
                xAccessor={'timestamp'}
                yAccessors={['averageCpuCoreNs']}
                timeZone="local"
                data={processedMetrics}
              />
              <LineSeries
                id="maxCpuCoreNs"
                name="Max CPU"
                xScaleType={ScaleType.Time}
                yScaleType={ScaleType.Linear}
                xAccessor={'timestamp'}
                yAccessors={['maxCpuCoreNs']}
                timeZone="local"
                data={processedMetrics}
              />
            </Chart>
          </EuiFlexItem>
        </EuiFlexGroup>
        <SectionRule />
        <K8sLogsTable logs={node.logs || []} />
        <SectionRule />
        <K8sPodsTable pods={node.pods} />
      </EuiPageTemplate.Section>
    </>
  );
}

function roundBytesToGB(bytes: number | null, places: number = 1) {
  if (bytes === null) {
    return null;
  }

  const multiplier = Math.pow(10, places);

  const preRounded = bytes / (100000000 / multiplier);
  return Math.round(preRounded) / multiplier;
}

// function roundNSToS(ns: number | null, places: number = 1) {
//   if (ns === null) {
//     return 0;
//   }

//   const multiplier = Math.pow(10, places);
//   const preRounded = ns / (1000000000 / multiplier);
//   return Math.round(preRounded) / multiplier;
// }
