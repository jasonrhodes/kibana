/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { Route, Routes } from '@kbn/shared-ux-router';
import { NotificationPoliciesPage } from '../pages/notification_policies_page';
import { NotificationPolicyDetailPage } from '../pages/notification_policy_detail_page';

export const NotificationPoliciesApp = () => (
  <Routes>
    <Route exact path="/:id">
      <NotificationPolicyDetailPage />
    </Route>
    <Route exact path="/">
      <NotificationPoliciesPage />
    </Route>
  </Routes>
);
