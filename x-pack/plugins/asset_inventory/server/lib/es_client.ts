/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

// TODO: Replace all of this with Kibana ES client and/or data plugin

import { Client } from '@elastic/elasticsearch';
const {
  ASSETS_ELASTICSEARCH_HOST: host,
  ASSETS_ELASTICSEARCH_USERNAME: username,
  ASSETS_ELASTICSEARCH_PASSWORD: password,
  ASSETS_ELASTICSEARCH_REJECT_UNAUTHORIZED_TLS: rejectUnauthorized = 0,
  SIGNALS_ELASTICSEARCH_HOST: signalsHost,
  SIGNALS_ELASTICSEARCH_USERNAME: signalsUsername,
  SIGNALS_ELASTICSEARCH_PASSWORD: signalsPassword,
  SIGNALS_ELASTICSEARCH_REJECT_UNAUTHORIZED_TLS: signalsRejectUnauthorized = 0,
} = process.env;

if (!host) {
  throw new Error('Missing ASSETS_ELASTICSEARCH_HOST env variable');
}

if (!username) {
  throw new Error('Missing ASSETS_ELASTICSEARCH_USERNAME env variable');
}

if (!password) {
  throw new Error('Missing ASSETS_ELASTICSEARCH_PASSWORD env variable');
}

export const esClient = new Client({
  node: host,
  auth: {
    username,
    password,
  },
  tls: {
    rejectUnauthorized: rejectUnauthorized === 'true' ? true : Boolean(Number(rejectUnauthorized)),
  },
});

export const signalsEsClient = new Client({
  node: signalsHost || host,
  auth: {
    username: signalsUsername || username,
    password: signalsPassword || password,
  },
  tls: {
    rejectUnauthorized:
      signalsRejectUnauthorized === 'true' ? true : Boolean(Number(signalsRejectUnauthorized)),
  },
});
