/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  IRouter,
  KibanaRequest,
  RequestHandlerContextBase,
  RouteValidatorConfig,
} from '@kbn/core-http-server';
import type { Logger } from '@kbn/logging';
import { createRouteValidationFunction } from '@kbn/io-ts-utils';
import * as t from 'io-ts';
import { ObservabilityDataRouteDependencies, SetupDependencies } from './types';
import { ApiRouteError } from './route_error';

export class RouteFactory<C extends RequestHandlerContextBase = RequestHandlerContextBase> {
  private router: IRouter<C>;
  public logger: Logger;
  private setupDependencies: SetupDependencies;

  constructor(router: IRouter<C>, logger: Logger, setupDependencies: SetupDependencies) {
    this.router = router;
    this.logger = logger;
    this.setupDependencies = setupDependencies;
  }

  create<R = unknown, P = unknown, Q = unknown, B = unknown>(
    options: PublicCreateRouteOptions<R, P, Q, B, C>
  ): void {
    this.router[options.method](
      {
        path: options.path,
        validate: createValidationFunctions<P, Q, B>(options.validate),
      },
      async (context, request, response) => {
        try {
          const dependencies = this.setupDependencies(request);
          const handlerContext = { ...context, dependencies };
          const responseBody = await options.handler(handlerContext, request);
          return response.ok({ body: responseBody });
        } catch (error: unknown) {
          if (error instanceof ApiRouteError) {
            return response.customError({
              body: {
                message: error.publicMessage,
              },
              statusCode: error.statusCode,
            });
          } else {
            this.logger.error(
              `An unknown error occurred while processing a server route for the observability data plugin -- ${error}`
            );
            return response.customError({
              body: {
                message: `An unknown error occurred`,
              },
              statusCode: 500,
            });
          }
        }
      }
    );
  }
}

type ProxyRouteHandler<
  R = {},
  P = unknown,
  Q = unknown,
  B = unknown,
  C extends RequestHandlerContextBase = RequestHandlerContextBase
> = (
  context: C & { dependencies: ObservabilityDataRouteDependencies },
  request: KibanaRequest<P, Q, B>
) => R | Promise<R>;

interface RouteValidationTypes {
  body?: t.Mixed;
  query?: t.Mixed;
  params?: t.Mixed;
}

export interface PublicCreateRouteOptions<
  R = unknown,
  P = unknown,
  Q = unknown,
  B = unknown,
  C extends RequestHandlerContextBase = RequestHandlerContextBase
> {
  method: 'put' | 'post' | 'get' | 'patch' | 'delete';
  path: string;
  validate?: RouteValidationTypes;
  handler: ProxyRouteHandler<R, P, Q, B, C>;
}

function createValidationFunctions<P = unknown, Q = unknown, B = unknown>(
  validationTypes?: RouteValidationTypes
) {
  const map: RouteValidatorConfig<P, Q, B> = {};

  if (validationTypes?.body) {
    map.body = createRouteValidationFunction(validationTypes.body);
  }

  if (validationTypes?.query) {
    map.query = createRouteValidationFunction(validationTypes.query);
  }

  if (validationTypes?.params) {
    map.params = createRouteValidationFunction(validationTypes.params);
  }

  return map;
}
