/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from '@kbn/shared-ux-router';
import { I18nProvider } from '@kbn/i18n-react';
import { KibanaThemeProvider } from '@kbn/kibana-react-plugin/public';
import type { CoreStart, AppMountParameters } from '@kbn/core/public';
import type { IncidentsPluginStartDeps } from './plugin';
import { IncidentsApp } from './components/incidents_app';

export interface ApplicationProps {
  core: CoreStart;
  plugins: IncidentsPluginStartDeps;
  appMountParameters: AppMountParameters;
}

export const renderApp = ({ core, plugins, appMountParameters }: ApplicationProps) => {
  const { element, history } = appMountParameters;

  ReactDOM.render(
    <KibanaThemeProvider theme$={core.theme.theme$}>
      <I18nProvider>
        <Router history={history}>
          <IncidentsApp core={core} plugins={plugins} />
        </Router>
      </I18nProvider>
    </KibanaThemeProvider>,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
