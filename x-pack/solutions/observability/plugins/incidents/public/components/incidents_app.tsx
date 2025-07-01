/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { Routes, Route } from '@kbn/shared-ux-router';
import {
  EuiPage,
  EuiPageBody,
  EuiPageSection,
  EuiPageHeader,
  EuiTitle,
  EuiText,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import type { CoreStart } from '@kbn/core/public';
import type { IncidentsPluginStartDeps } from '../plugin';

interface IncidentsAppProps {
  core: CoreStart;
  plugins: IncidentsPluginStartDeps;
}

export const IncidentsApp: React.FC<IncidentsAppProps> = ({ core, plugins }) => {
  return (
    <EuiPage restrictWidth={false}>
      <EuiPageBody>
        <EuiPageHeader>
          <EuiTitle size="l">
            <h1>
              {i18n.translate('xpack.incidents.appTitle', {
                defaultMessage: 'Incidents',
              })}
            </h1>
          </EuiTitle>
        </EuiPageHeader>
        <EuiPageSection>
          <Routes>
            <Route path="/" exact>
              <IncidentsHomePage />
            </Route>
          </Routes>
        </EuiPageSection>
      </EuiPageBody>
    </EuiPage>
  );
};

const IncidentsHomePage: React.FC = () => {
  return (
    <EuiText>
      <h2>
        {i18n.translate('xpack.incidents.homePage.title', {
          defaultMessage: 'Welcome to Incidents',
        })}
      </h2>
      <p>
        {i18n.translate('xpack.incidents.homePage.description', {
          defaultMessage: 'This is the incidents management application.',
        })}
      </p>
    </EuiText>
  );
};
