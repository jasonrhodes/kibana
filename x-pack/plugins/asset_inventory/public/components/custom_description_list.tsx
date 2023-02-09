/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiFlexGroup, EuiFlexItem, EuiSpacer, EuiText } from '@elastic/eui';
import React, { Fragment } from 'react';

export interface DLItem {
  title: string;
  description: string | React.ReactNode;
}

export function CustomDescriptionList({ items }: { items: DLItem[] }) {
  const pairs = items.reduce<Array<[DLItem, DLItem?]>>((p, item) => {
    const latest = p[p.length - 1];
    if (!latest || latest.length === 2) {
      p.push([item]);
    } else if (latest.length === 1) {
      latest.push(item);
    }
    return p;
  }, []);

  return (
    <>
      {pairs.map((pair, i) => (
        <Fragment key={`dl-row-${i}`}>
          <EuiFlexGroup>
            <CustomDLItem item={pair[0]} />
            <CustomDLItem item={pair[1]} />
          </EuiFlexGroup>
          {i === pairs.length - 1 ? null : <EuiSpacer />}
        </Fragment>
      ))}
    </>
  );
}

function CustomDLItem({ item }: { item?: DLItem }) {
  if (!item) {
    return null;
  }

  return (
    <EuiFlexItem>
      <EuiText>
        <b>{item.title}</b>
      </EuiText>
      <div>{item.description}</div>
    </EuiFlexItem>
  );
}
