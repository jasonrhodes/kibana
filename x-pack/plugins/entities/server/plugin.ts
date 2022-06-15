/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema } from '@kbn/config-schema';
import {
  CoreSetup,
  Plugin,
  PluginConfigDescriptor,
  PluginInitializerContext,
} from '@kbn/core/server';
import { Logger } from '@kbn/logging';
import { EntitiesConfig, EntitiesPluginSetup, EntitiesPluginStart } from './types';
import {
  data as fakeData,
  EntityType,
  EntityTypes,
  getByType,
  EntityBase,
  EntityInclude,
  EntityRelationships,
} from './fakeData';

export const config: PluginConfigDescriptor<EntitiesConfig> = {
  schema: schema.object({
    alerting: schema.object({
      inventory_threshold: schema.object({
        group_by_page_size: schema.number({ defaultValue: 5_000 }),
      }),
      metric_threshold: schema.object({
        group_by_page_size: schema.number({ defaultValue: 10_000 }),
      }),
    }),
    inventory: schema.object({
      compositeSize: schema.number({ defaultValue: 2000 }),
    }),
    sources: schema.maybe(
      schema.object({
        default: schema.maybe(
          schema.object({
            fields: schema.maybe(
              schema.object({
                message: schema.maybe(schema.arrayOf(schema.string())),
              })
            ),
          })
        ),
      })
    ),
  }),
};

export type { EntitiesConfig };

export class EntitiesServerPlugin implements Plugin<EntitiesPluginSetup, EntitiesPluginStart> {
  public config: EntitiesConfig;
  public logger: Logger;

  constructor(context: PluginInitializerContext<EntitiesConfig>) {
    this.config = context.config.get();
    this.logger = context.logger.get();
  }

  setup(core: CoreSetup) {
    const router = core.http.createRouter();
    const defaultOptions = {
      tags: ['access:entities'],
    };

    router.get(
      {
        path: '/api/entities',
        validate: false,
        options: defaultOptions,
      },
      (requestContext, request, response) => {
        return response.ok({ body: { hello: 'world' } });
      }
    );

    router.get<{ type: EntityType }, { include?: string }, {}>(
      {
        path: '/api/entities/{type}',
        validate: {
          params: schema.object({
            type: schema.oneOf<EntityType, EntityType, EntityType, EntityType>([
              schema.literal('hosts'),
              schema.literal('containers'),
              schema.literal('pods'),
              schema.literal('services'),
            ]),
          }),
          query: schema.object({
            include: schema.maybe(schema.string()),
          }),
        },
        options: defaultOptions,
      },
      (requestContext, request, response) => {
        const { type } = request.params;
        const { include } = request.query;
        const includeValues =
          typeof include === 'string' && include.length > 0 ? include.split(',') : [];
        if (validateIncludeList(includeValues)) {
          const { data, includes } = prepareData(type, includeValues);
          return response.ok({ body: { data, includes } });
        }
        return response.badRequest({
          body: { message: `At least one invalid value for include: ${include}` },
        });
      }
    );

    return {} as EntitiesPluginSetup;
  }

  start() {}

  stop() {}
}

function validateIncludeList(list: any[]): list is EntityInclude[] {
  return list.every((value) => value in EntityTypes || value in EntityRelationships);
}

function extractInclude(type: EntityType, id: number, includeValues: EntityInclude[]) {
  if (includeValues.includes(type)) {
    const relatedEntities = getByType(type);
    const fullEntity = relatedEntities.find((e) => e.id === id);
    // console.log('extracted?', type, id, fullEntity);
    if (fullEntity) {
      return fullEntity;
    }
  }
}

function prepareData(type: EntityType, includeValues: EntityInclude[]) {
  const data = fakeData.types[type];

  const bases = data.flatMap(({ relationships }) => {
    if (!relationships) {
      return [];
    }

    return Object.values(relationships)
      .filter((rel) => rel !== null)
      .flatMap((rel) => (Array.isArray(rel) ? rel : [rel])) as EntityBase[];
  });

  // de-dupe bases and extract full entity
  const includes = Array.from(new Set(bases.map((b) => `${b.type}:${b.id}`)))
    .map((str) => {
      const [baseType, id] = str.split(':');
      if (!validateType(baseType)) {
        throw new Error(`invalid type came from somewhere ${baseType}`);
      }

      return extractInclude(baseType, Number(id), includeValues);
    })
    .filter((entity) => !!entity);

  return { data, includes };
}

function validateType(type: string): type is EntityType {
  return Object.keys(EntityTypes).includes(type);
}
