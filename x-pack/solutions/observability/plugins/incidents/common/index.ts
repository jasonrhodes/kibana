/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export const PLUGIN_ID = 'incidents';
export const PLUGIN_NAME = 'Incidents';

// API routes
export const API_BASE_PATH = '/api/incidents';

// Types and interfaces shared between server and client
export interface IncidentStatus {
  id: string;
  name: string;
  color: string;
}

export interface Incident {
  id: string;
  title: string;
  description?: string;
  status: IncidentStatus;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  assignee?: string;
  tags: string[];
}
