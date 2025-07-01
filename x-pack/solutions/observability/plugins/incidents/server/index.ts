/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { PluginConfigDescriptor, PluginInitializerContext } from '@kbn/core/server';
import { IncidentsPlugin } from './plugin';
import { configSchema, type ConfigType } from './config';

export const config: PluginConfigDescriptor<ConfigType> = {
  schema: configSchema,
  exposeToBrowser: {
    enabled: true,
  },
};

export const plugin = (initializerContext: PluginInitializerContext) =>
  new IncidentsPlugin(initializerContext);

export type { IncidentsServerSetup, IncidentsServerStart } from './plugin';
export type { ConfigType };
