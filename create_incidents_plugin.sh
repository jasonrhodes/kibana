#!/bin/bash

# Script to create Kibana Incidents Plugin
# Run this from the root of your Kibana repository

set -e

PLUGIN_DIR="x-pack/solutions/observability/plugins/incidents"

echo "Creating Incidents plugin directory structure..."
mkdir -p "$PLUGIN_DIR/server"
mkdir -p "$PLUGIN_DIR/public/components"
mkdir -p "$PLUGIN_DIR/common"

echo "Creating kibana.jsonc..."
cat > "$PLUGIN_DIR/kibana.jsonc" << 'EOF'
{
  "type": "plugin",
  "id": "@kbn/incidents",
  "group": "observability",
  "plugin": {
    "id": "incidents",
    "configPath": ["x-pack", "incidents"],
    "browser": true,
    "server": true,
    "requiredPlugins": [
      "data",
      "dataViews",
      "features",
      "licensing",
      "spaces",
      "security",
      "usageCollection"
    ],
    "optionalPlugins": [
      "alerting",
      "notifications",
      "ruleRegistry",
      "taskManager",
      "fleet",
      "cloud"
    ],
    "requiredBundles": [
      "kibanaUtils",
      "kibanaReact",
      "esUiShared"
    ]
  }
}
EOF

echo "Creating tsconfig.json..."
cat > "$PLUGIN_DIR/tsconfig.json" << 'EOF'
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "target/types"
  },
  "include": [
    "common/**/*",
    "public/**/*",
    "server/**/*"
  ],
  "references": [
    { "path": "../../../../src/core/tsconfig.json" },
    { "path": "../../../../src/plugins/data/tsconfig.json" },
    { "path": "../../../../src/plugins/data_views/tsconfig.json" },
    { "path": "../../../../x-pack/plugins/features/tsconfig.json" },
    { "path": "../../../../x-pack/plugins/licensing/tsconfig.json" },
    { "path": "../../../../x-pack/plugins/spaces/tsconfig.json" },
    { "path": "../../../../x-pack/plugins/security/tsconfig.json" },
    { "path": "../../../../src/plugins/usage_collection/tsconfig.json" }
  ]
}
EOF

echo "Creating server/index.ts..."
cat > "$PLUGIN_DIR/server/index.ts" << 'EOF'
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { PluginConfigDescriptor, PluginInitializerContext } from '@kbn/core/server';
import { IncidentsPlugin } from './plugin';
import { configSchema, type ConfigType } from './config';

export const config: PluginConfigDescriptor<ConfigType> = {
  schema: configSchema,
  exposeToBrowser: {
    enabled: true,
  },
};

export const plugin = (initializerContext: PluginInitializerContext) =>
  new IncidentsPlugin(initializerContext);

export type { IncidentsServerSetup, IncidentsServerStart } from './plugin';
export type { ConfigType };
EOF

echo "Creating server/config.ts..."
cat > "$PLUGIN_DIR/server/config.ts" << 'EOF'
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema, TypeOf } from '@kbn/config-schema';

export const configSchema = schema.object({
  enabled: schema.boolean({ defaultValue: true }),
});

export type ConfigType = TypeOf<typeof configSchema>;
EOF

echo "Creating server/plugin.ts..."
cat > "$PLUGIN_DIR/server/plugin.ts" << 'EOF'
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '@kbn/core/server';
import type { DataPluginSetup, DataPluginStart } from '@kbn/data-plugin/server';
import type { DataViewsPluginSetup, DataViewsPluginStart } from '@kbn/data-views-plugin/server';
import type { FeaturesPluginSetup, FeaturesPluginStart } from '@kbn/features-plugin/server';
import type { LicensingPluginSetup, LicensingPluginStart } from '@kbn/licensing-plugin/server';
import type { SpacesPluginSetup, SpacesPluginStart } from '@kbn/spaces-plugin/server';
import type { SecurityPluginSetup, SecurityPluginStart } from '@kbn/security-plugin/server';
import type { UsageCollectionSetup } from '@kbn/usage-collection-plugin/server';

import type { ConfigType } from './config';

export interface IncidentsServerSetup {}

export interface IncidentsServerStart {}

export interface IncidentsPluginSetupDeps {
  data: DataPluginSetup;
  dataViews: DataViewsPluginSetup;
  features: FeaturesPluginSetup;
  licensing: LicensingPluginSetup;
  spaces: SpacesPluginSetup;
  security: SecurityPluginSetup;
  usageCollection?: UsageCollectionSetup;
}

export interface IncidentsPluginStartDeps {
  data: DataPluginStart;
  dataViews: DataViewsPluginStart;
  features: FeaturesPluginStart;
  licensing: LicensingPluginStart;
  spaces: SpacesPluginStart;
  security: SecurityPluginStart;
}

export class IncidentsPlugin
  implements Plugin<IncidentsServerSetup, IncidentsServerStart, IncidentsPluginSetupDeps, IncidentsPluginStartDeps>
{
  private readonly logger: Logger;
  private readonly config: ConfigType;

  constructor(private readonly initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
    this.config = initializerContext.config.get<ConfigType>();
  }

  public setup(
    core: CoreSetup<IncidentsPluginStartDeps, IncidentsServerStart>,
    plugins: IncidentsPluginSetupDeps
  ): IncidentsServerSetup {
    this.logger.debug('incidents: Setup');

    // Register feature
    plugins.features.registerKibanaFeature({
      id: 'incidents',
      name: 'Incidents',
      category: {
        id: 'observability',
        label: 'Observability',
        order: 1000,
      },
      app: ['kibana', 'incidents'],
      catalogue: ['incidents'],
      privileges: {
        all: {
          app: ['kibana', 'incidents'],
          catalogue: ['incidents'],
          api: ['incidents'],
          savedObject: {
            all: [],
            read: [],
          },
          ui: ['read', 'write'],
        },
        read: {
          app: ['kibana', 'incidents'],
          catalogue: ['incidents'],
          api: ['incidents'],
          savedObject: {
            all: [],
            read: [],
          },
          ui: ['read'],
        },
      },
    });

    // Register HTTP routes
    const router = core.http.createRouter();
    
    // TODO: Register your routes here
    router.get(
      {
        path: '/api/incidents/status',
        validate: false,
      },
      async (context, request, response) => {
        return response.ok({
          body: { status: 'ok' },
        });
      }
    );

    return {};
  }

  public start(core: CoreStart, plugins: IncidentsPluginStartDeps): IncidentsServerStart {
    this.logger.debug('incidents: Started');
    return {};
  }

  public stop() {
    this.logger.debug('incidents: Stopped');
  }
}
EOF

echo "Creating public/index.ts..."
cat > "$PLUGIN_DIR/public/index.ts" << 'EOF'
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { PluginInitializerContext } from '@kbn/core/public';
import { IncidentsPlugin } from './plugin';

export const plugin = (initializerContext: PluginInitializerContext) =>
  new IncidentsPlugin(initializerContext);

export type { IncidentsPublicSetup, IncidentsPublicStart } from './plugin';
EOF

echo "Creating public/plugin.ts..."
cat > "$PLUGIN_DIR/public/plugin.ts" << 'EOF'
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  AppMountParameters,
} from '@kbn/core/public';
import type { DataPublicPluginSetup, DataPublicPluginStart } from '@kbn/data-plugin/public';
import type { DataViewsPublicPluginSetup, DataViewsPublicPluginStart } from '@kbn/data-views-plugin/public';
import type { FeaturesPluginSetup, FeaturesPluginStart } from '@kbn/features-plugin/public';
import type { LicensingPluginSetup, LicensingPluginStart } from '@kbn/licensing-plugin/public';
import type { SpacesPluginSetup, SpacesPluginStart } from '@kbn/spaces-plugin/public';
import type { SecurityPluginSetup, SecurityPluginStart } from '@kbn/security-plugin/public';

export interface IncidentsPublicSetup {}

export interface IncidentsPublicStart {}

export interface IncidentsPluginSetupDeps {
  data: DataPublicPluginSetup;
  dataViews: DataViewsPublicPluginSetup;
  features: FeaturesPluginSetup;
  licensing: LicensingPluginSetup;
  spaces: SpacesPluginSetup;
  security: SecurityPluginSetup;
}

export interface IncidentsPluginStartDeps {
  data: DataPublicPluginStart;
  dataViews: DataViewsPublicPluginStart;
  features: FeaturesPluginStart;
  licensing: LicensingPluginStart;
  spaces: SpacesPluginStart;
  security: SecurityPluginStart;
}

export class IncidentsPlugin
  implements Plugin<IncidentsPublicSetup, IncidentsPublicStart, IncidentsPluginSetupDeps, IncidentsPluginStartDeps>
{
  constructor(private readonly initializerContext: PluginInitializerContext) {}

  public setup(
    core: CoreSetup<IncidentsPluginStartDeps, IncidentsPublicStart>,
    plugins: IncidentsPluginSetupDeps
  ): IncidentsPublicSetup {
    // Register application
    core.application.register({
      id: 'incidents',
      title: 'Incidents',
      appRoute: '/app/incidents',
      category: {
        id: 'observability',
        label: 'Observability',
        order: 1000,
      },
      mount: async (params: AppMountParameters) => {
        // Lazy load the application
        const { renderApp } = await import('./application');
        const [coreStart, pluginsStart] = await core.getStartServices();
        
        return renderApp({
          core: coreStart,
          plugins: pluginsStart,
          appMountParameters: params,
        });
      },
    });

    return {};
  }

  public start(core: CoreStart, plugins: IncidentsPluginStartDeps): IncidentsPublicStart {
    return {};
  }

  public stop() {}
}
EOF

echo "Creating public/application.tsx..."
cat > "$PLUGIN_DIR/public/application.tsx" << 'EOF'
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from '@kbn/shared-ux-router';
import { I18nProvider } from '@kbn/i18n-react';
import { KibanaThemeProvider } from '@kbn/kibana-react-plugin/public';
import type { CoreStart, AppMountParameters } from '@kbn/core/public';
import type { IncidentsPluginStartDeps } from './plugin';
import { IncidentsApp } from './components/incidents_app';

export interface ApplicationProps {
  core: CoreStart;
  plugins: IncidentsPluginStartDeps;
  appMountParameters: AppMountParameters;
}

export const renderApp = ({ core, plugins, appMountParameters }: ApplicationProps) => {
  const { element, history } = appMountParameters;

  ReactDOM.render(
    <KibanaThemeProvider theme$={core.theme.theme$}>
      <I18nProvider>
        <Router history={history}>
          <IncidentsApp core={core} plugins={plugins} />
        </Router>
      </I18nProvider>
    </KibanaThemeProvider>,
    element
  );

  return () => ReactDOM.unmountComponentAtNode(element);
};
EOF

echo "Creating public/components/incidents_app.tsx..."
cat > "$PLUGIN_DIR/public/components/incidents_app.tsx" << 'EOF'
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { Routes, Route } from '@kbn/shared-ux-router';
import {
  EuiPage,
  EuiPageBody,
  EuiPageSection,
  EuiPageHeader,
  EuiTitle,
  EuiText,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import type { CoreStart } from '@kbn/core/public';
import type { IncidentsPluginStartDeps } from '../plugin';

interface IncidentsAppProps {
  core: CoreStart;
  plugins: IncidentsPluginStartDeps;
}

export const IncidentsApp: React.FC<IncidentsAppProps> = ({ core, plugins }) => {
  return (
    <EuiPage restrictWidth={false}>
      <EuiPageBody>
        <EuiPageHeader>
          <EuiTitle size="l">
            <h1>
              {i18n.translate('xpack.incidents.appTitle', {
                defaultMessage: 'Incidents',
              })}
            </h1>
          </EuiTitle>
        </EuiPageHeader>
        <EuiPageSection>
          <Routes>
            <Route path="/" exact>
              <IncidentsHomePage />
            </Route>
          </Routes>
        </EuiPageSection>
      </EuiPageBody>
    </EuiPage>
  );
};

const IncidentsHomePage: React.FC = () => {
  return (
    <EuiText>
      <h2>
        {i18n.translate('xpack.incidents.homePage.title', {
          defaultMessage: 'Welcome to Incidents',
        })}
      </h2>
      <p>
        {i18n.translate('xpack.incidents.homePage.description', {
          defaultMessage: 'This is the incidents management application.',
        })}
      </p>
    </EuiText>
  );
};
EOF

echo "Creating common/index.ts..."
cat > "$PLUGIN_DIR/common/index.ts" << 'EOF'
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
EOF

echo "✅ Incidents plugin created successfully!"
echo ""
echo "Next steps:"
echo "1. Run: yarn kbn bootstrap"
echo "2. Run: yarn start"
echo "3. Navigate to: http://localhost:5601/app/incidents"
echo ""
echo "Plugin location: $PLUGIN_DIR"