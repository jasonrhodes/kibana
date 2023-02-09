/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type {
  PluginInitializerContext,
  Plugin,
  CoreSetup,
  Logger,
  CoreStart,
} from '@kbn/core/server';

import type {
  PluginStart as DataPluginStart,
  PluginSetup as DataPluginSetup,
} from '@kbn/data-plugin/server';

import type { TopologyAssetsPluginConfig } from './config';
// import { ruleRegistrySearchStrategyProvider, RULE_SEARCH_STRATEGY_NAME } from './search_strategy';

export interface TopologyAssetsPluginSetupDependencies {
  data: DataPluginSetup;
}

export interface TopologyAssetsPluginStartDependencies {
  data: DataPluginStart;
}

export interface TopologyAssetsPluginSetupContract {}

export interface TopologyAssetsPluginStartContract {}

export class TopologyAssetsPlugin
  implements
    Plugin<
      TopologyAssetsPluginSetupContract,
      TopologyAssetsPluginStartContract,
      TopologyAssetsPluginSetupDependencies,
      TopologyAssetsPluginStartDependencies
    >
{
  // private readonly config: TopologyAssetsPluginConfig;
  // private readonly logger: Logger;
  // private readonly kibanaVersion: string;

  constructor(initContext: PluginInitializerContext) {
    // this.config = initContext.config.get<TopologyAssetsPluginConfig>();
    // this.logger = initContext.logger.get();
    // this.kibanaVersion = initContext.env.packageInfo.version;
  }

  public setup(
    core: CoreSetup<TopologyAssetsPluginStartDependencies, TopologyAssetsPluginStartContract>,
    plugins: TopologyAssetsPluginSetupDependencies
  ): TopologyAssetsPluginSetupContract {
    // ROUTES
    const router = core.http.createRouter();

    router.get(
      {
        path: '/api/topology-assets/ping',
        validate: {},
      },
      async (context, request, response) => {
        return response.ok({
          body: {
            message: 'PONG',
          },
        });
      }
    );

    return {};
  }

  public start() {
    return {};
  }

  public stop() {}
}
