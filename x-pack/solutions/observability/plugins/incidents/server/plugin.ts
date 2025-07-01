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
  Logger,
} from '@kbn/core/server';
import type { DataPluginSetup, DataPluginStart } from '@kbn/data-plugin/server';
import type { DataViewsPluginSetup, DataViewsPluginStart } from '@kbn/data-views-plugin/server';
import type { FeaturesPluginSetup, FeaturesPluginStart } from '@kbn/features-plugin/server';
import type { LicensingPluginSetup, LicensingPluginStart } from '@kbn/licensing-plugin/server';
import type { SpacesPluginSetup, SpacesPluginStart } from '@kbn/spaces-plugin/server';
import type { SecurityPluginSetup, SecurityPluginStart } from '@kbn/security-plugin/server';
import type { UsageCollectionSetup } from '@kbn/usage-collection-plugin/server';

import type { ConfigType } from './config';

export interface IncidentsServerSetup {}

export interface IncidentsServerStart {}

export interface IncidentsPluginSetupDeps {
  data: DataPluginSetup;
  dataViews: DataViewsPluginSetup;
  features: FeaturesPluginSetup;
  licensing: LicensingPluginSetup;
  spaces: SpacesPluginSetup;
  security: SecurityPluginSetup;
  usageCollection?: UsageCollectionSetup;
}

export interface IncidentsPluginStartDeps {
  data: DataPluginStart;
  dataViews: DataViewsPluginStart;
  features: FeaturesPluginStart;
  licensing: LicensingPluginStart;
  spaces: SpacesPluginStart;
  security: SecurityPluginStart;
}

export class IncidentsPlugin
  implements Plugin<IncidentsServerSetup, IncidentsServerStart, IncidentsPluginSetupDeps, IncidentsPluginStartDeps>
{
  private readonly logger: Logger;
  private readonly config: ConfigType;

  constructor(private readonly initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
    this.config = initializerContext.config.get<ConfigType>();
  }

  public setup(
    core: CoreSetup<IncidentsPluginStartDeps, IncidentsServerStart>,
    plugins: IncidentsPluginSetupDeps
  ): IncidentsServerSetup {
    this.logger.debug('incidents: Setup');

    // Register feature
    plugins.features.registerKibanaFeature({
      id: 'incidents',
      name: 'Incidents',
      category: {
        id: 'observability',
        label: 'Observability',
        order: 1000,
      },
      app: ['kibana', 'incidents'],
      catalogue: ['incidents'],
      privileges: {
        all: {
          app: ['kibana', 'incidents'],
          catalogue: ['incidents'],
          api: ['incidents'],
          savedObject: {
            all: [],
            read: [],
          },
          ui: ['read', 'write'],
        },
        read: {
          app: ['kibana', 'incidents'],
          catalogue: ['incidents'],
          api: ['incidents'],
          savedObject: {
            all: [],
            read: [],
          },
          ui: ['read'],
        },
      },
    });

    // Register HTTP routes
    const router = core.http.createRouter();
    
    // TODO: Register your routes here
    router.get(
      {
        path: '/api/incidents/status',
        validate: false,
      },
      async (context, request, response) => {
        return response.ok({
          body: { status: 'ok' },
        });
      }
    );

    return {};
  }

  public start(core: CoreStart, plugins: IncidentsPluginStartDeps): IncidentsServerStart {
    this.logger.debug('incidents: Started');
    return {};
  }

  public stop() {
    this.logger.debug('incidents: Stopped');
  }
}
