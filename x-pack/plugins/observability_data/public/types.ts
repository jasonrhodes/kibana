/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { Plugin as PluginClass } from '@kbn/core/public';

export interface ObservabilityDataPublicPluginSetup {}

export interface ObservabilityDataPublicPluginStart {}

export type ObservabilityDataPluginClass = PluginClass<
  ObservabilityDataPublicPluginSetup | undefined,
  ObservabilityDataPublicPluginStart | undefined
>;
