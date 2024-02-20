/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { PluginConfigDescriptor, PluginInitializerContext } from '@kbn/core/server';
import type { ObservabilityDataConfig } from '../common/config';

import { configSchema, exposeToBrowserConfig } from '../common/config';
export type { ObservabilityDataPluginStart, ObservabilityDataPluginSetup } from './types';

export const config: PluginConfigDescriptor<ObservabilityDataConfig> = {
  exposeToBrowser: exposeToBrowserConfig,
  schema: configSchema,
};

export const plugin = async (ctx: PluginInitializerContext<ObservabilityDataConfig>) => {
  const { ObservabilityDataServerPlugin } = await import('./plugin');
  return new ObservabilityDataServerPlugin(ctx);
};
