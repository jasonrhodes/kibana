/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { Route, Routes } from '@kbn/shared-ux-router';
import { AlertsPage } from '../pages/alerts_page';
import { AlertDetailPage } from '../pages/alert_detail_page';

export const AlertsApp = () => (
  <Routes>
    <Route exact path="/:id">
      <AlertDetailPage />
    </Route>
    <Route exact path="/">
      <AlertsPage />
    </Route>
  </Routes>
);
