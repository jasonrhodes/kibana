/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export enum EntityTypes {
  hosts,
  pods,
  containers,
  services,
}

export enum EntityRelationships {
  'pod.hosts',
}

export type EntityType = keyof typeof EntityTypes;
export type EntityRelationship = keyof typeof EntityRelationships;
export type EntityInclude = EntityType | EntityRelationship;

export interface EntityBase {
  id: number;
  type: EntityType;
}

type WithFields<T> = T & {
  attributes?: Record<string, any>;
  relationships?: Record<string, EntityBase | EntityBase[] | null>;
};

interface HostBase extends EntityBase {
  type: 'hosts';
}

export interface Host extends WithFields<HostBase> {
  attributes: {
    name: string;
    os?: string;
  };
}

interface PodBase extends EntityBase {
  type: 'pods';
}

export interface Pod extends WithFields<PodBase> {
  attributes: {
    name: string;
    namespace?: string;
  };
  relationships: {
    host: HostBase;
  };
}

interface ContainerBase extends EntityBase {
  type: 'containers';
}

export interface Container extends WithFields<ContainerBase> {
  attributes: {
    name: string;
  };
  relationships: {
    host: HostBase | null;
    pod: PodBase | null;
  };
}

interface ServiceBase extends EntityBase {
  type: 'services';
}

export interface Service extends WithFields<ServiceBase> {
  attributes: {
    name: string;
  };
  relationships: {
    containers: ContainerBase[];
    hosts: HostBase[];
  };
}

export type Entity = Service | Host | Pod | Container;

interface FakeData {
  types: {
    hosts: Host[];
    pods: Pod[];
    containers: Container[];
    services: Service[];
  };
}

export function getByType(type: EntityType): Array<Host | Pod | Container | Service> {
  return data.types[type];
}

export const data: FakeData = {
  types: {
    hosts: [
      {
        id: 1001,
        type: 'hosts',
        attributes: {
          name: 'my-host-1',
        },
      },
      {
        id: 1002,
        type: 'hosts',
        attributes: {
          name: 'my-host-2',
        },
      },
      {
        id: 1003,
        type: 'hosts',
        attributes: {
          name: 'my-host-3',
        },
      },
      {
        id: 1004,
        type: 'hosts',
        attributes: {
          name: 'my-host-4',
        },
      },
      {
        id: 1005,
        type: 'hosts',
        attributes: {
          name: 'my-host-5',
        },
      },
    ],
    pods: [
      {
        id: 2001,
        type: 'pods',
        attributes: {
          name: 'my-pod-1',
          namespace: 'webapp',
        },
        relationships: {
          host: { id: 1002, type: 'hosts' },
        },
      },
      {
        id: 2002,
        type: 'pods',
        attributes: {
          name: 'my-pod-2',
          namespace: 'webapp',
        },
        relationships: {
          host: { id: 1002, type: 'hosts' },
        },
      },
      {
        id: 2003,
        type: 'pods',
        attributes: {
          name: 'my-pod-3',
          namespace: 'backend',
        },
        relationships: {
          host: { id: 1002, type: 'hosts' },
        },
      },
      {
        id: 2004,
        type: 'pods',
        attributes: {
          name: 'my-pod-4',
        },
        relationships: {
          host: { id: 1005, type: 'hosts' },
        },
      },
    ],
    containers: [
      {
        id: 3001,
        type: 'containers',
        attributes: {
          name: 'my-container-1',
        },
        relationships: {
          pod: null,
          host: { id: 1001, type: 'hosts' },
        },
      },
      {
        id: 3002,
        type: 'containers',
        attributes: {
          name: 'my-container-2',
        },
        relationships: {
          pod: { type: 'pods', id: 2002 },
          host: null,
        },
      },
    ],
    services: [
      {
        id: 4001,
        type: 'services',
        attributes: {
          name: 'my-ruby-service',
        },
        relationships: {
          containers: [
            { type: 'containers', id: 3001 },
            { type: 'containers', id: 3002 },
          ],
          hosts: [],
        },
      },
      {
        id: 4002,
        type: 'services',
        attributes: {
          name: 'my-nodejs-service',
        },
        relationships: {
          containers: [
            { type: 'containers', id: 3001 },
            { type: 'containers', id: 3002 },
          ],
          hosts: [],
        },
      },
      {
        id: 4003,
        type: 'services',
        attributes: {
          name: 'my-golang-service',
        },
        relationships: {
          containers: [],
          hosts: [{ type: 'hosts', id: 1004 }],
        },
      },
    ],
  },
};
