/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { AppMountParameters, CoreSetup, CoreStart, PluginInitializerContext } from '@kbn/core/public';
import { Logger } from '@kbn/logging';

import { ObservabilityDataPluginClass } from './types';
import type { ObservabilityDataPublicConfig } from '../common/config';
import { ObsDataClient } from './lib/client';

export class ObservabilityDataPublicPlugin implements ObservabilityDataPluginClass {
  public config: ObservabilityDataPublicConfig;
  public logger: Logger;

  constructor(context: PluginInitializerContext<{}>) {
    this.config = context.config.get();
    this.logger = context.logger.get();
  }

  setup(core: CoreSetup) {
    // Check for config value and bail out if not "alpha-enabled"
    // if (!this.config.alphaEnabled) {
    //   this.logger.debug('Observability Data browser side is NOT enabled');
    //   return;
    // }

    this.logger.debug('Public is enabled');

    const obsDataClient = new ObsDataClient(core.http);

    const mount = async (params: AppMountParameters<unknown>) => {
      const { renderApp } = await import('./render_app');
      return renderApp({
        appMountParameters: params,
        obsDataClient
      })
    };

    const app = {
      id: 'observability_data',
      appRoute: '/app/observability_data_poc',
      mount,
      order: 8000,
      title: 'Observability Data POC view'
    };

    core.application.register(app);

    return {
      obsDataClient
    };
  }

  start(core: CoreStart) {
    // Check for config value and bail out if not "alpha-enabled"
    // if (!this.config.alphaEnabled) {
    //   return;
    // }



    return {};
  }

  stop() {}
}