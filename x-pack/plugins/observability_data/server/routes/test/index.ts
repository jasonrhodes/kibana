/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import * as t from 'io-ts';
import { ApiRouteError } from '../route_error';
import { RouteFactory } from '../route_factory';
import { ObservabilityDataRequestHandlerContext } from '../types';

export function registerTestRoutes(
  routeFactory: RouteFactory<ObservabilityDataRequestHandlerContext>
) {
  const queryRT = t.type({
    qp: t.string,
  });

  type RequestParams = null;
  type RequestQuery = t.TypeOf<typeof queryRT>;
  type RequestBody = null;
  interface Response {
    message: string;
  }

  routeFactory.create<Response, RequestParams, RequestQuery, RequestBody>({
    method: 'get',
    path: '/internal/observability_data/test',
    validate: {
      query: queryRT,
    },
    handler: async (context, request) => {
      // const { esClient } = context.dependencies;
      const { qp } = request.query;
      if (qp === 'throw') {
        throw new ApiRouteError('A problem occurred', {
          statusCode: 400,
        });
      }
      return { message: `Responding successfully, ${qp}` };
    },
  });
}
