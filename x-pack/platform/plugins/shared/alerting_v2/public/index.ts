/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { ContainerModule } from 'inversify';
import { OnSetup, PluginSetup, PluginStart, Start } from '@kbn/core-di';
import { CoreSetup } from '@kbn/core-di-browser';
import type { ManagementSetup } from '@kbn/management-plugin/public';
import type { DataPublicPluginStart } from '@kbn/data-plugin/public';
import type { DataViewsPublicPluginStart } from '@kbn/data-views-plugin/public';
import type { LensPublicStart } from '@kbn/lens-plugin/public';
import { mountAlertingV2App } from './main';
import { ALERTING_V2_APP_ID } from './constants';
import {
  PREVIEW_SECTION_ID,
  PREVIEW_WHY_V2_APP_ID,
  PREVIEW_RULES_APP_ID,
  PREVIEW_ALERTS_APP_ID,
  PREVIEW_NOTIFICATION_POLICIES_APP_ID,
} from './preview/constants';
import { createMountFn } from './preview/mount';
import { WhyV2App } from './preview/apps/why_v2_app';
import { RulesApp } from './preview/apps/rules_app';
import { AlertsApp } from './preview/apps/alerts_app';
import { NotificationPoliciesApp } from './preview/apps/notification_policies_app';
import { NotificationPoliciesApi } from './services/notification_policies_api';
import { RulesApi } from './services/rules_api';
import { WorkflowsApi } from './services/workflows_api';
import { setKibanaServices } from './kibana_services';
import { DynamicRuleFormFlyout } from './create_rule_form_flyout';
import type { AlertingV2PublicStart } from './types';

export type { AlertingV2PublicStart } from './types';
export type { CreateRuleFormFlyoutProps } from './create_rule_form_flyout';

export const module = new ContainerModule(({ bind }) => {
  bind(RulesApi).toSelf().inSingletonScope();
  bind(NotificationPoliciesApi).toSelf().inSingletonScope();
  bind(WorkflowsApi).toSelf().inSingletonScope();
  bind(Start).toConstantValue({
    DynamicRuleFormFlyout,
  } satisfies AlertingV2PublicStart);
  bind(OnSetup).toConstantValue((container) => {
    const getStartServices = container.get(CoreSetup('getStartServices'));

    getStartServices().then(([coreStart]) => {
      const diContainer = coreStart.injection.getContainer();
      setKibanaServices({
        http: coreStart.http,
        notifications: coreStart.notifications,
        application: coreStart.application,
        data: diContainer.get(PluginStart('data')) as DataPublicPluginStart,
        dataViews: diContainer.get(PluginStart('dataViews')) as DataViewsPublicPluginStart,
        lens: diContainer.get(PluginStart('lens')) as LensPublicStart,
      });
    });

    const management = container.get(PluginSetup('management')) as ManagementSetup;
    management.sections.section.insightsAndAlerting.registerApp({
      id: ALERTING_V2_APP_ID,
      title: 'Rules V2',

      order: 1,
      async mount(params) {
        const [coreStart] = await getStartServices();
        return mountAlertingV2App({ params, container: coreStart.injection.getContainer() });
      },
    });

    const previewSection = management.sections.register({
      id: PREVIEW_SECTION_ID,
      title: 'V2 Alerting Preview',
      order: 1,
      tip: 'Preview the next-generation alerting experience',
    });

    previewSection.registerApp({
      id: PREVIEW_WHY_V2_APP_ID,
      title: 'Why v2?',
      order: 0,
      async mount(params) {
        return createMountFn(WhyV2App)(params);
      },
    });

    previewSection.registerApp({
      id: PREVIEW_RULES_APP_ID,
      title: 'Rules',
      order: 1,
      async mount(params) {
        return createMountFn(RulesApp)(params);
      },
    });

    previewSection.registerApp({
      id: PREVIEW_ALERTS_APP_ID,
      title: 'Alerts & Episodes',
      order: 2,
      async mount(params) {
        return createMountFn(AlertsApp)(params);
      },
    });

    previewSection.registerApp({
      id: PREVIEW_NOTIFICATION_POLICIES_APP_ID,
      title: 'Notification Policies',
      order: 3,
      async mount(params) {
        return createMountFn(NotificationPoliciesApp)(params);
      },
    });
  });
});
