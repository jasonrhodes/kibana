/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiInMemoryTable, EuiText } from '@elastic/eui';
import React from 'react';
import { K8sNodeLog } from '../../common/types_api';
import { relativeTimeString } from '../lib/relative_time';

export function K8sLogsTable({ logs }: { logs: K8sNodeLog[] }) {
  const columns = [
    {
      field: 'timestamp',
      name: 'Timestamp',
      sortable: true,
      width: '400px',
      render: (ts: string) => relativeTimeString(new Date(ts)),
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
        <b>Node Logs (Last 12 Hours)</b>
      </EuiText>
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
