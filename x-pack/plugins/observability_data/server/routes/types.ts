/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { KibanaRequest, RequestHandlerContextBase } from '@kbn/core-http-server';
import type { CustomRequestHandlerContext } from '@kbn/core/server';
import * as t from 'io-ts';
import type { EsClientMap } from '../types';

// list plugin dependency contracts here?
export type ObservabilityDataRequestHandlerContext = CustomRequestHandlerContext<{}>;

export type SetupDependencies = (
  request: KibanaRequest<unknown, unknown, unknown>
) => ObservabilityDataRouteDependencies;

export interface ObservabilityDataRouteDependencies {
  esClient: EsClientMap;
}

export interface RouteValidationTypes {
  body?: t.Mixed;
  query?: t.Mixed;
  params?: t.Mixed;
}

export type ProxyRouteHandler<
  R = {},
  P = unknown,
  Q = unknown,
  B = unknown,
  C extends RequestHandlerContextBase = RequestHandlerContextBase
> = (
  context: C & { dependencies: ObservabilityDataRouteDependencies },
  request: KibanaRequest<P, Q, B>
) => R | Promise<R>;

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