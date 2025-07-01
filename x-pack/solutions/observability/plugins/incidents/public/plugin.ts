/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  AppMountParameters,
} from '@kbn/core/public';
import type { DataPublicPluginSetup, DataPublicPluginStart } from '@kbn/data-plugin/public';
import type { DataViewsPublicPluginSetup, DataViewsPublicPluginStart } from '@kbn/data-views-plugin/public';
import type { FeaturesPluginSetup, FeaturesPluginStart } from '@kbn/features-plugin/public';
import type { LicensingPluginSetup, LicensingPluginStart } from '@kbn/licensing-plugin/public';
import type { SpacesPluginSetup, SpacesPluginStart } from '@kbn/spaces-plugin/public';
import type { SecurityPluginSetup, SecurityPluginStart } from '@kbn/security-plugin/public';

export interface IncidentsPublicSetup {}

export interface IncidentsPublicStart {}

export interface IncidentsPluginSetupDeps {
  data: DataPublicPluginSetup;
  dataViews: DataViewsPublicPluginSetup;
  features: FeaturesPluginSetup;
  licensing: LicensingPluginSetup;
  spaces: SpacesPluginSetup;
  security: SecurityPluginSetup;
}

export interface IncidentsPluginStartDeps {
  data: DataPublicPluginStart;
  dataViews: DataViewsPublicPluginStart;
  features: FeaturesPluginStart;
  licensing: LicensingPluginStart;
  spaces: SpacesPluginStart;
  security: SecurityPluginStart;
}

export class IncidentsPlugin
  implements Plugin<IncidentsPublicSetup, IncidentsPublicStart, IncidentsPluginSetupDeps, IncidentsPluginStartDeps>
{
  constructor(private readonly initializerContext: PluginInitializerContext) {}

  public setup(
    core: CoreSetup<IncidentsPluginStartDeps, IncidentsPublicStart>,
    plugins: IncidentsPluginSetupDeps
  ): IncidentsPublicSetup {
    // Register application
    core.application.register({
      id: 'incidents',
      title: 'Incidents',
      appRoute: '/app/incidents',
      category: {
        id: 'observability',
        label: 'Observability',
        order: 1000,
      },
      mount: async (params: AppMountParameters) => {
        // Lazy load the application
        const { renderApp } = await import('./application');
        const [coreStart, pluginsStart] = await core.getStartServices();
        
        return renderApp({
          core: coreStart,
          plugins: pluginsStart,
          appMountParameters: params,
        });
      },
    });

    return {};
  }

  public start(core: CoreStart, plugins: IncidentsPluginStartDeps): IncidentsPublicStart {
    return {};
  }

  public stop() {}
}
