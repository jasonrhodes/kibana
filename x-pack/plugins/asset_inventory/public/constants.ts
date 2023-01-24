/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { AssetStatus, CloudProviderName } from '../common/types_api';

export const cloudIconMap: Record<CloudProviderName, string> = {
  gcp: 'logoGCP',
  aws: 'logoAWS',
  azure: 'logoAzure',
  other: 'questionInCircle',
  unknown: 'questionInCircle',
  none: 'crossInACircleFilled',
};

export const statusMap: Record<AssetStatus, string> = {
  ACTIVE: 'success',
  CREATING: 'subdued',
  DELETING: 'subdued',
  FAILED: 'danger',
  UPDATING: 'subdued',
  PENDING: 'warning',
  UNKNOWN: 'subdued',
};
