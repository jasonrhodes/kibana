/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiInMemoryTable } from '@elastic/eui';
import React from 'react';
import { K8sPod } from '../../common/types_api';
import { relativeTimeString } from '../lib/relative_time';

export function K8sPodsTable({ isLoading, pods }: { isLoading?: boolean; pods?: K8sPod[] }) {
  if (!pods) {
    return null;
  }

  const columns = [
    {
      field: 'name',
      name: 'Pod name',
      sortable: true,
      width: '400px',
    },
    {
      field: 'id',
      name: 'Pod UID',
      sortable: true,
    },
    {
      field: '@timestamp',
      name: 'Last Seen',
      render: (ts: string) => relativeTimeString(new Date(ts)),
    },
  ];

  // @ts-ignore
  return <EuiInMemoryTable loading={isLoading} columns={columns} items={pods} />;
}
