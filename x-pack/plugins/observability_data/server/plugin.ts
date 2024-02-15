/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  Plugin,
  CoreSetup,
  CoreStart,
  PluginInitializerContext,
  PluginConfigDescriptor,
  Logger,
} from '@kbn/core/server';

import { registerServerRoutes } from './routes/register_routes';
// import { ObservabilityDataClient } from './lib/obs_data_client';
import {
  ObservabilityDataPluginSetupDependencies,
  ObservabilityDataPluginStartDependencies,
} from './types';
import { ObservabilityDataConfig, configSchema, exposeToBrowserConfig } from '../common/config';

export type ObservabilityDataServerPluginSetup = ReturnType<ObservabilityDataServerPlugin['setup']>;
export type ObservabilityDataServerPluginStart = ReturnType<ObservabilityDataServerPlugin['start']>;

export const config: PluginConfigDescriptor<ObservabilityDataConfig> = {
  schema: configSchema,
  exposeToBrowser: exposeToBrowserConfig,
};

export class ObservabilityDataServerPlugin
  implements
    Plugin<
      ObservabilityDataServerPluginSetup,
      ObservabilityDataServerPluginStart,
      ObservabilityDataPluginSetupDependencies,
      ObservabilityDataPluginStartDependencies
    >
{
  public config: ObservabilityDataConfig;
  public logger: Logger;

  constructor(context: PluginInitializerContext<ObservabilityDataConfig>) {
    this.config = context.config.get();
    this.logger = context.logger.get();
  }

  public setup(core: CoreSetup, plugins: ObservabilityDataPluginSetupDependencies) {
    // Check for config value and bail out if not "alpha-enabled"
    // if (!this.config.alphaEnabled) {
    //   this.logger.info('Server is NOT enabled');
    //   return;
    // }

    this.logger.info('Server is enabled');

    registerServerRoutes({ core, logger: this.logger });

    return {};
  }

  public start(core: CoreStart) {
    // Check for config value and bail out if not "alpha-enabled"
    // if (!this.config.alphaEnabled) {
    //   return;
    // }

    return {};
  }

  public stop() {}
}
