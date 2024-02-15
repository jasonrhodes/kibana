/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { CoreSetup, KibanaRequest, Logger } from '@kbn/core/server';
import { registerListHostsRoute } from './list';
import { RouteFactory } from './route_factory';
import { registerTestRoutes } from './test';
import { ObservabilityDataRequestHandlerContext } from './types';

export async function registerServerRoutes({ core, logger }: { core: CoreSetup; logger: Logger }) {
  const router = core.http.createRouter<ObservabilityDataRequestHandlerContext>();
  const [coreStart] = await core.getStartServices();
  const setupDependencies = (request: KibanaRequest) => ({
    esClient: {
      asInternalUser: coreStart.elasticsearch.client.asInternalUser,
      asScopedUser: coreStart.elasticsearch.client.asScoped(request).asCurrentUser,
    },
  });

  const routeFactory = new RouteFactory<ObservabilityDataRequestHandlerContext>(
    router,
    logger,
    setupDependencies
  );

  registerTestRoutes(routeFactory);
  registerListHostsRoute(routeFactory);
}
