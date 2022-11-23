/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema } from '@kbn/config-schema';
import { Plugin, CoreSetup } from '@kbn/core/server';
import { AssetFilters } from '../common/types_api';
import { getAssets } from './lib/get_assets';
import { getK8sCluster } from './lib/get_k8s_cluster';
import { getK8sClusters } from './lib/get_k8s_clusters';
import { getValuesForField } from './lib/get_values_for_field';

export type AssetInventoryServerPluginSetup = ReturnType<AssetInventoryServerPlugin['setup']>;

export class AssetInventoryServerPlugin implements Plugin<AssetInventoryServerPluginSetup> {
  public async setup(core: CoreSetup) {
    const router = core.http.createRouter();

    router.get(
      {
        path: '/api/asset-inventory/ping',
        validate: false,
      },
      (context, req, res) => {
        return res.ok({
          body: { message: 'Asset Inventory OK' },
          headers: { 'content-type': 'application/json' },
        });
      }
    );

    router.get<unknown, AssetFilters | undefined, unknown>(
      {
        path: '/api/asset-inventory',
        validate: {
          query: schema.any({}),
        },
      },
      async (context, req, res) => {
        const filters = req.query || {};

        try {
          const assets = await getAssets({ filters });
          return res.ok({ body: { assets } });
        } catch (error: unknown) {
          // console.log('error looking up asset records', error);
          return res.customError({ statusCode: 500 });
        }
      }
    );

    router.get(
      {
        path: '/api/asset-inventory/field-values',
        validate: {
          query: schema.any({}),
        },
      },
      async (context, req, res) => {
        const { field, searchText, version } = req.query;

        try {
          const results = await getValuesForField({
            field,
            searchText,
            version: Number(version),
          });
          return res.ok({ body: { results } });
        } catch (error: unknown) {
          // console.log('error looking up field values', error);
          return res.customError({ statusCode: 500 });
        }
      }
    );

    router.get(
      {
        path: '/api/asset-inventory/k8s/clusters',
        validate: false,
      },
      async (context, req, res) => {
        try {
          const results = await getK8sClusters();
          return res.ok({ body: { results } });
        } catch (error: unknown) {
          // console.log('error looking up field values', error);
          return res.customError({ statusCode: 500 });
        }
      }
    );

    router.get<{ name: string }, {}, {}>(
      {
        path: '/api/asset-inventory/k8s/clusters/{name}',
        validate: {
          params: schema.object({
            name: schema.string(),
          }),
        },
      },
      async (context, req, res) => {
        const name = req.params.name;
        try {
          const result = await getK8sCluster(name);
          return res.ok({ body: { result } });
        } catch (error: unknown) {
          // console.log('error looking up field values', error);
          return res.customError({ statusCode: 500 });
        }
      }
    );

    return {};
  }

  public start() {}

  public stop() {}
}
