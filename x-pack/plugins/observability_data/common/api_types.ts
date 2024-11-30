import type { QuerySource } from "./runtime_types";

export interface HostService {
  name: string;
  environment?: string;
}

export interface HostContainer {
  id: string;
}

export interface FullHostRecord {
  // sources: string[];
  services: Record<string, any>[];
  containers: Record<string, any>[];
  hostname: string;
  timestamp?: number;
}

export interface RouteResponseList {
  hosts: FullHostRecord[];
}

export interface GetHostsOptions {
  sources: QuerySource[];
  dateRange: {
    gte: string | Date,
    lte?: string | Date
  }
}


export interface IObsDataClient {
  getHosts: (options: GetHostsOptions) => Promise<RouteResponseList>;
}