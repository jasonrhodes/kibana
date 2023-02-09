/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiInMemoryTable, EuiSpacer, EuiText } from '@elastic/eui';
import React from 'react';
import { K8sNodeLog } from '../../common/types_api';

export function K8sLogsTable({ logs }: { logs: K8sNodeLog[] }) {
  const columns = [
    {
      field: 'timestamp',
      name: 'Timestamp',
      sortable: true,
      width: '400px',
      render: (ts: string) => getUTCTime(new Date(ts)),
    },
    {
      field: 'message',
      name: 'Message',
      sortable: true,
    },
  ];

  return (
    <>
      <EuiText>
        <b>Node Logs (Last 24 Hours, 500 logs max)</b>
      </EuiText>
      <EuiSpacer />
      <EuiInMemoryTable<K8sNodeLog>
        loading={false}
        columns={columns}
        items={logs}
        pagination={true}
        sorting={true}
        search={{
          box: {
            incremental: true,
            schema: true,
          },
        }}
      />
    </>
  );
}

function getUTCTime(date: Date) {
  const hour = padLeft(date.getUTCHours());
  const minute = padLeft(date.getUTCMinutes());
  const second = padLeft(date.getUTCSeconds());
  return `${hour}:${minute}:${second}`;
}

function padLeft(n: number) {
  if (n < 10) {
    return `0${n}`;
  }

  return `${n}`;
}
