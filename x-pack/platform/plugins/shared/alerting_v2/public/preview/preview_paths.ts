/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { PREVIEW_SECTION_ID, PREVIEW_WHY_V2_APP_ID, PREVIEW_RULES_APP_ID, PREVIEW_ALERTS_APP_ID, PREVIEW_NOTIFICATION_POLICIES_APP_ID } from './constants';

const base = (appId: string) => `/app/management/${PREVIEW_SECTION_ID}/${appId}`;

export const previewPaths = {
  whyV2: base(PREVIEW_WHY_V2_APP_ID),
  rules: base(PREVIEW_RULES_APP_ID),
  ruleDetail: (id: string) => `${base(PREVIEW_RULES_APP_ID)}/${id}`,
  alerts: base(PREVIEW_ALERTS_APP_ID),
  alertDetail: (id: string) => `${base(PREVIEW_ALERTS_APP_ID)}/${id}`,
  notificationPolicies: base(PREVIEW_NOTIFICATION_POLICIES_APP_ID),
  notificationPolicyDetail: (id: string) => `${base(PREVIEW_NOTIFICATION_POLICIES_APP_ID)}/${id}`,
} as const;
