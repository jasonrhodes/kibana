/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';
import { EuiFlexGroup, EuiFlexItem, EuiLink } from '@elastic/eui';
import moment from 'moment';
import { Columns } from '../../load_more_table';
import { AnomaliesByHost, Anomaly, NarrowDateRange } from '../types';
import { getRowItemDraggable } from '../../tables/helpers';
import { EntityDraggable } from '../entity_draggable';
import { createCompoundHostKey } from './create_compound_key';
import { HostDetailsLink } from '../../links';

import * as i18n from './translations';
import { getEntries } from '../get_entries';
import { DraggableScore } from '../score/draggable_score';
import { createExplorerLink } from '../links/create_explorer_link';
import { LocalizedDateTooltip } from '../../localized_date_tooltip';
import { PreferenceFormattedDate } from '../../formatted_date';
import { HostsType } from '../../../store/hosts/model';

export const getAnomaliesHostTableColumns = (
  startDate: number,
  endDate: number,
  interval: string,
  narrowDateRange: NarrowDateRange
): [
  Columns<AnomaliesByHost['hostName'], AnomaliesByHost>,
  Columns<Anomaly['severity'], AnomaliesByHost>,
  Columns<Anomaly['jobId'], AnomaliesByHost>,
  Columns<Anomaly['entityValue'], AnomaliesByHost>,
  Columns<Anomaly['influencers'], AnomaliesByHost>,
  Columns<Anomaly['time'], AnomaliesByHost>
] => [
  {
    name: i18n.HOST_NAME,
    field: 'hostName',
    sortable: true,
    render: (hostName, anomaliesByHost) =>
      getRowItemDraggable({
        rowItem: hostName,
        attrName: 'host.name',
        idPrefix: `anomalies-host-table-hostName-${createCompoundHostKey(
          anomaliesByHost
        )}-hostName`,
        render: item => <HostDetailsLink hostName={item} />,
      }),
  },
  {
    name: i18n.DETECTOR,
    field: 'anomaly.jobId',
    sortable: true,
    render: (jobId, anomaliesByHost) => (
      <EuiLink
        href={`${createExplorerLink(anomaliesByHost.anomaly, startDate, endDate)}`}
        target="_blank"
      >
        {jobId}
      </EuiLink>
    ),
  },
  {
    name: i18n.SCORE,
    field: 'anomaly.severity',
    sortable: true,
    render: (_, anomaliesByHost) => (
      <DraggableScore
        id={`anomalies-host-table-severity-${createCompoundHostKey(anomaliesByHost)}`}
        score={anomaliesByHost.anomaly}
      />
    ),
  },
  {
    name: i18n.ENTITY,
    field: 'anomaly.entityValue',
    sortable: true,
    render: (entityValue, anomaliesByHost) => (
      <EntityDraggable
        idPrefix={`anomalies-host-table-entityValue${createCompoundHostKey(
          anomaliesByHost
        )}-entity`}
        entityName={anomaliesByHost.anomaly.entityName}
        entityValue={entityValue}
      />
    ),
  },
  {
    name: i18n.INFLUENCED_BY,
    field: 'anomaly.influencers',
    render: (influencers, anomaliesByHost) => (
      <EuiFlexGroup direction="column" gutterSize="none" responsive={false}>
        {influencers.map(influencer => {
          const [key, value] = getEntries(influencer);
          const entityName = key != null ? key : '';
          const entityValue = value != null ? value : '';
          return (
            <EuiFlexItem
              key={`${entityName}-${entityValue}-${createCompoundHostKey(anomaliesByHost)}`}
              grow={false}
            >
              <EuiFlexGroup gutterSize="none" responsive={false}>
                <EuiFlexItem grow={false}>
                  <EntityDraggable
                    idPrefix={`anomalies-host-table-influencers-${entityName}-${entityValue}-${createCompoundHostKey(
                      anomaliesByHost
                    )}`}
                    entityName={entityName}
                    entityValue={entityValue}
                  />
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
          );
        })}
      </EuiFlexGroup>
    ),
  },
  {
    name: i18n.TIME_STAMP,
    field: 'anomaly.time',
    sortable: true,
    render: time => (
      <LocalizedDateTooltip date={moment(new Date(time)).toDate()}>
        <PreferenceFormattedDate value={new Date(time)} />
      </LocalizedDateTooltip>
    ),
  },
];

export const getAnomaliesHostTableColumnsCurated = (
  pageType: HostsType,
  startDate: number,
  endDate: number,
  interval: string,
  narrowDateRange: NarrowDateRange
) => {
  const columns = getAnomaliesHostTableColumns(startDate, endDate, interval, narrowDateRange);

  // Columns to exclude from host details pages
  if (pageType === 'details') {
    return columns.filter(column => column.name !== i18n.HOST_NAME);
  } else {
    return columns;
  }
};
