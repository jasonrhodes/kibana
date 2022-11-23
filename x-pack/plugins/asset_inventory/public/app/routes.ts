/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { RouteProps } from 'react-router-dom';
import { AssetInventoryListPage } from '../pages/asset_inventory_list_page';
import { K8sClustersListPage } from '../pages/k8s/clusters_list_page';
import { K8sClusterPage } from '../pages/k8s/cluster_page';

export const routes: RouteProps[] = [
  {
    path: '/',
    exact: true,
    component: AssetInventoryListPage,
  },
  {
    path: '/k8s/clusters',
    exact: true,
    component: K8sClustersListPage,
  },
  {
    path: '/k8s/clusters/:name',
    exact: true,
    component: K8sClusterPage,
  },
];
