/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { loadAwsK8s, loadAzureK8s, loadK8sAssets } from '@elastic/asset-collection';
import { EsClientOptions } from '@elastic/asset-collection/dist/lib/shared/es_client';

export async function collectAssets({ types }: { types: string[] }) {
  const results = [];
  const doAll = types.includes('all');

  const ES_CONFIG: EsClientOptions = {
    host: process.env.ASSETS_ELASTICSEARCH_HOST,
    username: process.env.ASSETS_ELASTICSEARCH_USERNAME,
    password: process.env.ASSETS_ELASTICSEARCH_PASSWORD,
    tlsRejectUnauthorized: Boolean(
      Number(process.env.ASSETS_ELASTICSEARCH_REJECT_UNAUTHORIZED_TLS)
    ),
    index: process.env.ASSETS_DATASTREAM,
  };

  if (doAll || types.includes('aws-k8s')) {
    if (!process.env.ASSETS_AWS_REGIONS) {
      throw new Error(
        'Cannot collect AWS K8s assets without specifying one or more valid AWS regions, provided as ASSETS_AWS_REGIONS=us-east-1,us-east2'
      );
    }
    results.push(
      await loadAwsK8s(ES_CONFIG, { region: process.env.ASSETS_AWS_REGIONS.split(',') })
    );
  }

  if (doAll || types.includes('azure-k8s')) {
    if (!process.env.ASSETS_AZURE_SUBSCRIPTION_ID) {
      throw new Error(
        'Cannot collect Azure K8s assets without a valid Azure Subscription ID provided as ASSETS_AZURE_SUBSCRIPTION_ID'
      );
    }
    results.push(await loadAzureK8s(ES_CONFIG, process.env.ASSETS_AZURE_SUBSCRIPTION_ID));
  }

  if (doAll || types.includes('k8s-api')) {
    results.push(await loadK8sAssets(ES_CONFIG));
  }

  return results;
}
