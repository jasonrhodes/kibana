/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';
import { z } from '@kbn/zod/v4';
import type { CommonTriggerDefinition } from '@kbn/workflows-extensions/common';

/**
 * Fires after every v1 alerting rule execution that produces at least one alert
 * state transition (new, active-ongoing, or recovered alerts).
 *
 * Unlike `type: alert` (which requires users to add the `.workflows` connector
 * action to each rule), this trigger fires automatically for all rules without
 * any per-rule configuration. Workflow authors subscribe by declaring
 * `type: alerting.alertStateChanged` and filter with a KQL `on.condition`.
 */
export const AlertStateChangedTriggerId = 'alerting.alertStateChanged' as const;

const alertGroupSchema = z.object({
  count: z.number().int().min(0).describe(
    i18n.translate('xpack.alerting.triggers.alertStateChanged.schema.count', {
      defaultMessage: 'Number of alerts in this group.',
    })
  ),
  ids: z.array(z.string()).describe(
    i18n.translate('xpack.alerting.triggers.alertStateChanged.schema.ids', {
      defaultMessage: 'Alert instance IDs in this group. Use in KQL conditions to filter by instance.',
    })
  ),
});

export const alertStateChangedEventSchema = z.object({
  rule: z
    .object({
      id: z.string().describe(
        i18n.translate('xpack.alerting.triggers.alertStateChanged.schema.rule.id', {
          defaultMessage: 'Rule ID.',
        })
      ),
      name: z.string().describe(
        i18n.translate('xpack.alerting.triggers.alertStateChanged.schema.rule.name', {
          defaultMessage: 'Rule name.',
        })
      ),
      spaceId: z.string().describe(
        i18n.translate('xpack.alerting.triggers.alertStateChanged.schema.rule.spaceId', {
          defaultMessage: 'Kibana space ID where the rule lives.',
        })
      ),
      consumer: z.string().describe(
        i18n.translate('xpack.alerting.triggers.alertStateChanged.schema.rule.consumer', {
          defaultMessage: 'Plugin that owns this rule (e.g. "alerts", "observability").',
        })
      ),
      ruleTypeId: z.string().describe(
        i18n.translate('xpack.alerting.triggers.alertStateChanged.schema.rule.ruleTypeId', {
          defaultMessage: 'Rule type identifier.',
        })
      ),
      tags: z.array(z.string()).describe(
        i18n.translate('xpack.alerting.triggers.alertStateChanged.schema.rule.tags', {
          defaultMessage: 'Rule tags.',
        })
      ),
    })
    .describe(
      i18n.translate('xpack.alerting.triggers.alertStateChanged.schema.rule', {
        defaultMessage: 'Identity of the rule whose execution produced this event.',
      })
    ),
  alerts: z
    .object({
      new: alertGroupSchema.describe(
        i18n.translate('xpack.alerting.triggers.alertStateChanged.schema.alerts.new', {
          defaultMessage: 'Alerts that transitioned to active for the first time this run.',
        })
      ),
      recovered: alertGroupSchema.describe(
        i18n.translate('xpack.alerting.triggers.alertStateChanged.schema.alerts.recovered', {
          defaultMessage: 'Alerts that recovered this run.',
        })
      ),
      active: z
        .object({
          count: z.number().int().min(0).describe(
            i18n.translate('xpack.alerting.triggers.alertStateChanged.schema.alerts.active.count', {
              defaultMessage: 'Total active alerts after this run (includes ongoing + new).',
            })
          ),
        })
        .describe(
          i18n.translate('xpack.alerting.triggers.alertStateChanged.schema.alerts.active', {
            defaultMessage: 'All active alerts after this run.',
          })
        ),
    })
    .describe(
      i18n.translate('xpack.alerting.triggers.alertStateChanged.schema.alerts', {
        defaultMessage: 'Alert state groups from this execution.',
      })
    ),
});

export type AlertStateChangedPayload = z.infer<typeof alertStateChangedEventSchema>;

export const alertStateChangedTriggerDefinition: CommonTriggerDefinition<
  typeof alertStateChangedEventSchema
> = {
  id: AlertStateChangedTriggerId,
  stability: 'tech_preview',
  eventSchema: alertStateChangedEventSchema,
  title: i18n.translate('xpack.alerting.workflowTriggers.alertStateChanged.title', {
    defaultMessage: 'Alerting - Alert state changed',
  }),
  description: i18n.translate('xpack.alerting.workflowTriggers.alertStateChanged.description', {
    defaultMessage:
      'Fires after a v1 rule execution that produces new, recovered, or active alert state transitions. No per-rule configuration required — subscribe with a KQL condition to filter by rule name, consumer, or tags.',
  }),
  documentation: {
    details: i18n.translate(
      'xpack.alerting.workflowTriggers.alertStateChanged.documentation.details',
      {
        defaultMessage:
          'Fires after every rule run that has at least one alert in a new, recovered, or active state. ' +
          'The payload includes rule identity (id, name, spaceId, consumer, ruleTypeId, tags) and alert ' +
          'counts/ids for new and recovered groups. Use `alerts.new.ids` and `alerts.recovered.ids` in ' +
          'workflow steps to fetch full alert documents from `.alerts-*`.',
      }
    ),
    examples: [
      i18n.translate(
        'xpack.alerting.workflowTriggers.alertStateChanged.documentation.example1',
        {
          defaultMessage: `## React to new alerts from any rule tagged "k8s"
\`\`\`yaml
triggers:
  - type: {triggerId}
    on:
      condition: 'rule.tags: "k8s" and alerts.new.count > 0'
\`\`\``,
          values: { triggerId: AlertStateChangedTriggerId },
        }
      ),
      i18n.translate(
        'xpack.alerting.workflowTriggers.alertStateChanged.documentation.example2',
        {
          defaultMessage: `## React to any alert from a specific rule
\`\`\`yaml
triggers:
  - type: {triggerId}
    on:
      condition: 'rule.id: "my-rule-id"'
\`\`\``,
          values: { triggerId: AlertStateChangedTriggerId },
        }
      ),
    ],
  },
  snippets: { condition: 'rule.tags: "my-tag" and alerts.new.count > 0' },
};
