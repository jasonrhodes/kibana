/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export interface ApiRouteErrorOptions {
  statusCode?: number;
  publicMessage?: string;
}

export class ApiRouteError extends Error {
  public statusCode: number;
  public publicMessage: string;

  constructor(message: string, options: ApiRouteErrorOptions = {}) {
    super(message);
    this.statusCode = options.statusCode || 500;
    this.publicMessage = options.publicMessage || message;
  }
}
