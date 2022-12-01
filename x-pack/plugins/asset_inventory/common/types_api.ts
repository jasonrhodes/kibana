/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export type AssetKind = 'unknown' | 'node';
export type AssetType = 'k8s.pod' | 'k8s.cluster' | 'k8s.node';

export interface ECSDocument {
  '@timestamp': string;
  kubernetes?: EcsKubernetesFieldset;
  orchestrator?: EcsOrchestratorFieldset;
  cloud?: EcsCloudFieldset;
}

export type AssetStatus = 'CREATING' | 'ACTIVE' | 'DELETING' | 'FAILED' | 'UPDATING' | 'PENDING';

export interface Asset extends ECSDocument {
  'asset.collection_version'?: string;
  'asset.ean': string;
  'asset.id': string;
  'asset.kind': AssetKind;
  'asset.name'?: string;
  'asset.type': AssetType;
  'asset.status'?: AssetStatus;
  'asset.parents'?: string | string[];
  'asset.children'?: string | string[];
  'asset.namespace'?: string;
}

export interface K8sPod extends ECSDocument {
  id: string;
  name: string;
  ean: string;
  node?: string;
}

export interface K8sNode extends ECSDocument {
  id: string;
  name: string;
  ean: string;
  pods?: K8sPod[];
  cluster?: string;
}

export interface K8sCluster extends ECSDocument {
  name: string;
  nodes: K8sNode[];
  status: string;
  version: string;
}

export interface EcsKubernetesFieldset {
  namespace?: string;
  pod?: {
    name: string;
    uid: string;
    start_time?: Date;
  };
  node?: {
    name: string;
    start_time?: Date;
  };
}

// See: https://www.elastic.co/guide/en/ecs/current/ecs-orchestrator.html
export interface EcsOrchestratorFieldset {
  api_version?: string;
  namespace?: string;
  organization?: string;
  type?: string;
  cluster?: {
    id?: string;
    name?: string;
    url?: string;
    version?: string;
  };
  resource?: {
    id?: string;
    ip?: string;
    name?: string;
    type?: string;
    parent?: {
      type?: string;
    };
  };
}

export type CloudProviderName = 'aws' | 'gcp' | 'azure' | 'other' | 'unknown' | 'none';

export interface EcsCloudFieldset {
  provider: CloudProviderName;
  region?: string;
  service?: {
    name?: string;
  };
}

export interface AssetFilters {
  type?: AssetType;
  kind?: AssetKind;
  ean?: string;
  id?: string;
  typeLike?: string;
  eanLike?: string;
  collectionVersion?: number | 'latest' | 'all';
}
