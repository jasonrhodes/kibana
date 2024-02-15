/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { PluginInitializer, PluginInitializerContext } from '@kbn/core/public';
import { ObservabilityDataPublicPlugin } from './plugin';
import { ObservabilityDataPublicPluginSetup, ObservabilityDataPublicPluginStart } from './types';

export const plugin: PluginInitializer<
  ObservabilityDataPublicPluginSetup | undefined,
  ObservabilityDataPublicPluginStart | undefined
> = (context: PluginInitializerContext) => {
  return new ObservabilityDataPublicPlugin(context);
};

export type { ObservabilityDataPublicPluginSetup, ObservabilityDataPublicPluginStart };
export type ObservabilityDataAppId = 'observabilityData';
