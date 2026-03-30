/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import type { AppMountParameters, AppUnmount } from '@kbn/core-application-browser';
import { Router } from '@kbn/shared-ux-router';
import { I18nProvider } from '@kbn/i18n-react';

type PreviewMountParams = Pick<AppMountParameters, 'element' | 'history'>;

export const createMountFn =
  (AppComponent: React.ComponentType) =>
  ({ element, history }: PreviewMountParams): AppUnmount => {
    ReactDOM.render(
      <I18nProvider>
        <Router history={history}>
          <AppComponent />
        </Router>
      </I18nProvider>,
      element
    );

    return () => ReactDOM.unmountComponentAtNode(element);
  };
